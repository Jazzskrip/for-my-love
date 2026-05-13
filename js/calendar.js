/* === Calendar Logic === */

const calendar = document.getElementById('calendar');
const couponOverlay = document.getElementById('couponOverlay');
const couponCard = document.getElementById('couponCard');
const couponTitle = document.getElementById('couponTitle');
const couponDesc = document.getElementById('couponDesc');
const couponMessage = document.getElementById('couponMessage');
const progressCounter = document.getElementById('progressCounter');
const infoButton = document.getElementById('infoButton');
const infoOverlay = document.getElementById('infoOverlay');
const infoClose = document.querySelector('.info-close');
const infoTitle = document.getElementById('infoTitle');
const userName = document.getElementById('userName');
const instructionsText = document.getElementById('instructionsText');
const pageTitle = document.getElementById('pageTitle');
const pageSubtitle = document.getElementById('pageSubtitle');
const infoList = document.getElementById('infoList');
const userCouponsBtn = document.getElementById('userCouponsBtn');
const userCouponOverlay = document.getElementById('userCouponOverlay');
const userCouponList = document.getElementById('userCouponList');
const userCouponClose = document.getElementById('userCouponClose');

let pendingCouponOpen = null;
let rewards = [];
let totalDays = 0;

function setCouponOpen(open) {
    document.body.classList.toggle('coupon-open', open);
    couponOverlay.setAttribute('aria-hidden', open ? 'false' : 'true');
}

function setInfoOpen(open) {
    document.body.classList.toggle('info-open', open);
    infoOverlay.setAttribute('aria-hidden', open ? 'false' : 'true');
}

function setUserCouponOpen(open) {
    document.body.classList.toggle('user-coupon-open', open);
    userCouponOverlay.setAttribute('aria-hidden', open ? 'false' : 'true');
}

async function loadRewards() {
    const response = await fetch('data/rewards.json', { cache: 'no-store' });
    if (!response.ok) {
        throw new Error('rewards.json');
    }
    const data = await response.json();
    if (data && Array.isArray(data.items)) {
        return data;
    }
    return { page: null, items: [] };
}

async function loadTheme() {
    const response = await fetch('data/theme-a.json', { cache: 'no-store' });
    if (!response.ok) {
        throw new Error('theme-a.json');
    }
    const data = await response.json();
    if (data && data.vars) {
        Object.entries(data.vars).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value);
        });
    }
}

async function loadInfo() {
    const response = await fetch('data/info.json', { cache: 'no-store' });
    if (!response.ok) {
        throw new Error('info.json');
    }
    const data = await response.json();
    if (data && Array.isArray(data.items)) {
        return data;
    }
    return { title: 'Справка', items: [] };
}

const START_DATE = '2026-05-29';

function getToday() {
    const debugDate = localStorage.getItem('adventDebugDate');
    if (debugDate) {
        return debugDate;
    }
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function getMaxAvailableDay() {
    const start = new Date(START_DATE + 'T00:00:00');
    const today = new Date(getToday() + 'T00:00:00');
    const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 0;
    return diff + 1;
}

let openedDays = [];
let openedCoupons = [];

function renderUserCoupons() {
    if (!userCouponList) {
        return;
    }
    const normalized = Array.isArray(openedCoupons)
        ? openedCoupons.map((item) => ({ ...item, used: Boolean(item.used) }))
        : [];
    const active = normalized.filter((item) => !item.used);
    const used = normalized.filter((item) => item.used);
    userCouponList.innerHTML = "";

    const renderSection = (title, items) => {
        const section = document.createElement('div');
        section.className = 'user-coupon-section';
        const heading = document.createElement('div');
        heading.className = 'user-coupon-title';
        heading.textContent = title;
        section.appendChild(heading);
        if (!items.length) {
            const empty = document.createElement('div');
            empty.className = 'user-coupon-empty';
            empty.textContent = 'Купонов пока нет.';
            section.appendChild(empty);
            return section;
        }
        items.forEach((coupon) => {
            const row = document.createElement('div');
            row.className = `user-coupon-row${coupon.used ? ' used' : ''}`;
            row.innerHTML = `
                <div class="user-coupon-emoji">${coupon.icon || '🎁'}</div>
                <div>
                    <div class="user-coupon-name">${coupon.title || 'Купон'}</div>
                    <div class="user-coupon-desc">${coupon.desc || ''}</div>
                </div>
            `;
            section.appendChild(row);
        });
        return section;
    };

    userCouponList.appendChild(renderSection('Активные', active));
    userCouponList.appendChild(renderSection('Использованные', used));
}

function loadLocalProgress() {
    try {
        const saved = JSON.parse(localStorage.getItem('adventProgress') || '{}');
        openedDays = Array.isArray(saved.openedDays) ? saved.openedDays : [];
        openedCoupons = Array.isArray(saved.openedCoupons) ? saved.openedCoupons : [];
    } catch (error) {
        openedDays = [];
        openedCoupons = [];
    }
}

function saveLocalProgress() {
    localStorage.setItem('adventProgress', JSON.stringify({
        openedDays,
        openedCoupons
    }));
}

const cards = [];

function getCardByDay(dayNumber) {
    const entry = cards.find((item) => item.day === dayNumber);
    return entry ? entry.card : null;
}

function updateLockState() {
    const maxDay = getMaxAvailableDay();
    cards.forEach(({ day, card }) => {
        const opened = openedDays.includes(day);
        const available = !opened && day <= maxDay;
        const locked = day > maxDay;
        card.classList.toggle('locked', locked);
        card.classList.toggle('opened', opened);
        card.classList.toggle('available', available);

        if (opened) {
            card.classList.add('flipped');
        }
    });

    if (progressCounter) {
        const total = totalDays || 0;
        progressCounter.textContent = `Открыто ${openedDays.length}/${total}`;
    }
}

function triggerShine(card) {
    card.classList.add('shine');
    window.setTimeout(() => {
        card.classList.remove('shine');
    }, 1100);
}

function markDayOpened(card, dayNumber, reward) {
    card.querySelectorAll('.matrix-rain').forEach(el => el.remove());
    card.classList.add('flipped');
    if (!openedDays.includes(dayNumber)) {
        openedDays.push(dayNumber);
        openedDays.sort((a, b) => a - b);
    }
    if (reward && reward.coupon) {
        const exists = openedCoupons.some((item) => Number(item.slot) === dayNumber);
        if (!exists) {
            openedCoupons.push({
                slot: dayNumber,
                icon: reward.icon || '',
                title: reward.title || '',
                desc: reward.desc || '',
                coupon: reward.coupon
            });
        }
    }
    saveLocalProgress();
    updateLockState();
}

function showCouponModal(reward, card, dayNumber) {
    couponTitle.textContent = reward.title;
    couponDesc.textContent = reward.desc;
    couponMessage.textContent = 'Нажми, чтобы получить подарок.';
    pendingCouponOpen = { card, dayNumber, reward };
    setCouponOpen(true);
    launchConfetti();
}

function handleCardToggle(card, dayNumber, reward) {
    if (openedDays.includes(dayNumber)) {
        card.classList.add('flipped');
        return;
    }

    const maxDay = getMaxAvailableDay();
    if (dayNumber > maxDay) {
        return;
    }

    if (reward.coupon) {
        showCouponModal(reward, card, dayNumber);
        return;
    }

    markDayOpened(card, dayNumber, reward);
}

function renderRewards(items) {
    cards.length = 0;
    calendar.innerHTML = '';
    totalDays = items.length;

    items.forEach((reward) => {
        const dayNumber = reward.slot;
        const card = document.createElement('div');
        card.className = 'day-card';
        card.dataset.day = String(dayNumber);
        card.innerHTML = `
            <div class="card-front">
                ${reward.coupon ? '<span class="coupon-badge">Купон</span>' : ''}
                <div class="day-number">${dayNumber}</div>
                <div class="day-label">День</div>
            </div>
            <div class="card-back">
                ${reward.coupon ? '<span class="coupon-badge">Купон</span>' : ''}
                <div class="reward-icon">${reward.icon}</div>
                <div class="reward-title">${reward.title}</div>
                <div class="reward-desc">${reward.desc}</div>
                <div class="day-marker">День ${dayNumber}</div>
            </div>
        `;

        let touchStartTime;

        card.addEventListener('touchstart', () => {
            touchStartTime = Date.now();
        }, { passive: true });

        card.addEventListener('touchend', (event) => {
            if (Date.now() - touchStartTime < 200) {
                event.preventDefault();
                handleCardToggle(card, dayNumber, reward);
            }
        });

        card.addEventListener('click', () => {
            if (!('ontouchstart' in window)) {
                handleCardToggle(card, dayNumber, reward);
            }
        });

        cards.push({ day: dayNumber, card });
        calendar.appendChild(card);
    });

    updateLockState();
}

if (infoButton && infoOverlay) {
    infoButton.addEventListener('click', () => {
        setInfoOpen(true);
    });

    infoOverlay.addEventListener('click', (event) => {
        if (event.target === infoOverlay) {
            setInfoOpen(false);
        }
    });

    if (infoClose) {
        infoClose.addEventListener('click', () => {
            setInfoOpen(false);
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            setInfoOpen(false);
        }
    });
}

if (userCouponsBtn && userCouponOverlay) {
    userCouponsBtn.addEventListener('click', () => {
        renderUserCoupons();
        setUserCouponOpen(true);
    });

    userCouponOverlay.addEventListener('click', (event) => {
        if (event.target === userCouponOverlay) {
            setUserCouponOpen(false);
        }
    });

    if (userCouponClose) {
        userCouponClose.addEventListener('click', () => {
            setUserCouponOpen(false);
        });
    }
}

/* ===== DEBUG MENU: палитры и переключение ===== */

const DEBUG_PALETTES = {
    rose: {
        '--bg-gradient': 'linear-gradient(135deg, #ffffff 0%, #ffffff 100%)',
        '--bg-spots': 'radial-gradient(ellipse at 50% 45%, rgba(255, 200, 215, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(255, 230, 238, 0.15) 0%, transparent 70%), none',
        '--text-main': '#3a2a2f',
        '--title-gradient': 'linear-gradient(135deg, #c47085 0%, #c47085 100%)',
        '--subtitle-color': 'rgba(140, 70, 90, 0.8)',
        '--progress-color': 'rgba(140, 70, 90, 0.75)',
        '--panel-bg': 'rgba(255, 255, 255, 0.78)',
        '--panel-border': 'rgba(220, 150, 170, 0.5)',
        '--panel-shadow': '0 15px 50px rgba(220, 150, 170, 0.18), 0 0 30px rgba(255, 200, 220, 0.12)',
        '--panel-name': '#c47085',
        '--panel-text': 'rgba(140, 70, 90, 0.75)',
        '--fab-border': 'rgba(220, 150, 170, 0.5)',
        '--fab-bg': 'rgba(255, 255, 255, 0.9)',
        '--fab-color': '#c47085',
        '--fab-shadow': '0 15px 50px rgba(220, 150, 170, 0.18), 0 0 30px rgba(255, 200, 220, 0.12)',
        '--info-overlay-bg': 'rgba(10, 10, 20, 0.6)',
        '--info-card-bg': 'rgba(255, 255, 255, 0.92)',
        '--info-card-border': 'rgba(220, 150, 170, 0.4)',
        '--info-card-shadow': '0 24px 70px rgba(0, 0, 0, 0.25)',
        '--info-title': '#c47085',
        '--info-label': '#c47085',
        '--info-row': 'rgba(140, 70, 90, 0.75)',
        '--info-close-border': 'rgba(220, 150, 170, 0.5)',
        '--info-close-bg': 'rgba(255, 255, 255, 0.9)',
        '--info-close-color': '#c47085',
        '--card-front-bg': 'linear-gradient(145deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 240, 245, 0.75) 60%, rgba(255, 230, 238, 0.7) 100%)',
        '--card-front-border': 'rgba(220, 150, 170, 0.35)',
        '--card-front-shadow': '0 12px 35px rgba(140, 70, 90, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        '--card-front-hover-border': 'rgba(220, 150, 170, 0.6)',
        '--card-front-hover-shadow': '0 15px 50px rgba(220, 150, 170, 0.2), 0 0 30px rgba(255, 200, 220, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        '--card-back-bg': 'linear-gradient(145deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 240, 245, 0.75) 60%, rgba(255, 230, 238, 0.7) 100%)',
        '--card-back-border': 'rgba(220, 150, 170, 0.4)',
        '--card-back-shadow': '0 12px 35px rgba(140, 70, 90, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        '--day-number-gradient': 'linear-gradient(180deg, #c47085 0%, #d4899b 100%)',
        '--day-label-color': 'rgba(140, 70, 90, 0.6)',
        '--reward-title': '#c47085',
        '--reward-desc': 'rgba(140, 70, 90, 0.75)',
        '--coupon-badge-bg': 'linear-gradient(135deg, #f2b5c6, #e896ab)',
        '--instructions-bg': 'rgba(255, 240, 245, 0.75)',
        '--instructions-border': 'rgba(220, 150, 170, 0.3)',
        '--instructions-text': 'rgba(140, 70, 90, 0.8)',
        '--coupon-overlay-bg': 'rgba(10, 10, 20, 0.75)',
        '--coupon-card-bg': 'linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 240, 245, 0.92) 100%)',
        '--coupon-card-border': 'rgba(220, 150, 170, 0.6)',
        '--coupon-card-shadow': '0 15px 50px rgba(220, 150, 170, 0.18), 0 0 30px rgba(255, 200, 220, 0.12)',
        '--coupon-title': '#c47085',
        '--coupon-text': 'rgba(140, 70, 90, 0.85)',
        '--coupon-text-font': "'Nunito', sans-serif",
        '--coupon-title-secondary': 'rgba(140, 70, 90, 0.85)',
        '--locked-label': 'rgba(140, 70, 90, 0.8)',
        '--locked-label-bg': 'rgba(0, 0, 0, 0.15)'
    },

    lavender: {
        '--bg-gradient': 'linear-gradient(135deg, #ffffff 0%, #ffffff 100%)',
        '--bg-spots': 'radial-gradient(ellipse at 50% 45%, rgba(200, 180, 255, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(230, 220, 255, 0.15) 0%, transparent 70%), none',
        '--text-main': '#2e2a3a',
        '--title-gradient': 'linear-gradient(135deg, #8b6bae 0%, #8b6bae 100%)',
        '--subtitle-color': 'rgba(90, 60, 120, 0.8)',
        '--progress-color': 'rgba(90, 60, 120, 0.75)',
        '--panel-bg': 'rgba(255, 255, 255, 0.78)',
        '--panel-border': 'rgba(170, 140, 210, 0.5)',
        '--panel-shadow': '0 15px 50px rgba(170, 140, 210, 0.18), 0 0 30px rgba(200, 180, 255, 0.12)',
        '--panel-name': '#8b6bae',
        '--panel-text': 'rgba(90, 60, 120, 0.75)',
        '--fab-border': 'rgba(170, 140, 210, 0.5)',
        '--fab-bg': 'rgba(255, 255, 255, 0.9)',
        '--fab-color': '#8b6bae',
        '--fab-shadow': '0 15px 50px rgba(170, 140, 210, 0.18), 0 0 30px rgba(200, 180, 255, 0.12)',
        '--info-overlay-bg': 'rgba(10, 10, 20, 0.6)',
        '--info-card-bg': 'rgba(255, 255, 255, 0.92)',
        '--info-card-border': 'rgba(170, 140, 210, 0.4)',
        '--info-card-shadow': '0 24px 70px rgba(0, 0, 0, 0.25)',
        '--info-title': '#8b6bae',
        '--info-label': '#8b6bae',
        '--info-row': 'rgba(90, 60, 120, 0.75)',
        '--info-close-border': 'rgba(170, 140, 210, 0.5)',
        '--info-close-bg': 'rgba(255, 255, 255, 0.9)',
        '--info-close-color': '#8b6bae',
        '--card-front-bg': 'linear-gradient(145deg, rgba(255, 255, 255, 0.75) 0%, rgba(245, 240, 255, 0.75) 60%, rgba(235, 225, 255, 0.7) 100%)',
        '--card-front-border': 'rgba(170, 140, 210, 0.35)',
        '--card-front-shadow': '0 12px 35px rgba(90, 60, 120, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        '--card-front-hover-border': 'rgba(170, 140, 210, 0.6)',
        '--card-front-hover-shadow': '0 15px 50px rgba(170, 140, 210, 0.2), 0 0 30px rgba(200, 180, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        '--card-back-bg': 'linear-gradient(145deg, rgba(255, 255, 255, 0.75) 0%, rgba(245, 240, 255, 0.75) 60%, rgba(235, 225, 255, 0.7) 100%)',
        '--card-back-border': 'rgba(170, 140, 210, 0.4)',
        '--card-back-shadow': '0 12px 35px rgba(90, 60, 120, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        '--day-number-gradient': 'linear-gradient(180deg, #8b6bae 0%, #a688c4 100%)',
        '--day-label-color': 'rgba(90, 60, 120, 0.6)',
        '--reward-title': '#8b6bae',
        '--reward-desc': 'rgba(90, 60, 120, 0.75)',
        '--coupon-badge-bg': 'linear-gradient(135deg, #c4b0e0, #a688c4)',
        '--instructions-bg': 'rgba(245, 240, 255, 0.75)',
        '--instructions-border': 'rgba(170, 140, 210, 0.3)',
        '--instructions-text': 'rgba(90, 60, 120, 0.8)',
        '--coupon-overlay-bg': 'rgba(10, 10, 20, 0.75)',
        '--coupon-card-bg': 'linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(245, 240, 255, 0.92) 100%)',
        '--coupon-card-border': 'rgba(170, 140, 210, 0.6)',
        '--coupon-card-shadow': '0 15px 50px rgba(170, 140, 210, 0.18), 0 0 30px rgba(200, 180, 255, 0.12)',
        '--coupon-title': '#8b6bae',
        '--coupon-text': 'rgba(90, 60, 120, 0.85)',
        '--coupon-text-font': "'Nunito', sans-serif",
        '--coupon-title-secondary': 'rgba(90, 60, 120, 0.85)',
        '--locked-label': 'rgba(90, 60, 120, 0.8)',
        '--locked-label-bg': 'rgba(0, 0, 0, 0.15)'
    },

    mint: {
        '--bg-gradient': 'linear-gradient(135deg, #ffffff 0%, #ffffff 100%)',
        '--bg-spots': 'radial-gradient(ellipse at 50% 45%, rgba(170, 230, 210, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(210, 245, 235, 0.15) 0%, transparent 70%), none',
        '--text-main': '#2a3a35',
        '--title-gradient': 'linear-gradient(135deg, #5a9e8f 0%, #5a9e8f 100%)',
        '--subtitle-color': 'rgba(55, 110, 95, 0.8)',
        '--progress-color': 'rgba(55, 110, 95, 0.75)',
        '--panel-bg': 'rgba(255, 255, 255, 0.78)',
        '--panel-border': 'rgba(120, 200, 180, 0.5)',
        '--panel-shadow': '0 15px 50px rgba(120, 200, 180, 0.18), 0 0 30px rgba(170, 230, 210, 0.12)',
        '--panel-name': '#5a9e8f',
        '--panel-text': 'rgba(55, 110, 95, 0.75)',
        '--fab-border': 'rgba(120, 200, 180, 0.5)',
        '--fab-bg': 'rgba(255, 255, 255, 0.9)',
        '--fab-color': '#5a9e8f',
        '--fab-shadow': '0 15px 50px rgba(120, 200, 180, 0.18), 0 0 30px rgba(170, 230, 210, 0.12)',
        '--info-overlay-bg': 'rgba(10, 10, 20, 0.6)',
        '--info-card-bg': 'rgba(255, 255, 255, 0.92)',
        '--info-card-border': 'rgba(120, 200, 180, 0.4)',
        '--info-card-shadow': '0 24px 70px rgba(0, 0, 0, 0.25)',
        '--info-title': '#5a9e8f',
        '--info-label': '#5a9e8f',
        '--info-row': 'rgba(55, 110, 95, 0.75)',
        '--info-close-border': 'rgba(120, 200, 180, 0.5)',
        '--info-close-bg': 'rgba(255, 255, 255, 0.9)',
        '--info-close-color': '#5a9e8f',
        '--card-front-bg': 'linear-gradient(145deg, rgba(255, 255, 255, 0.75) 0%, rgba(235, 250, 245, 0.75) 60%, rgba(220, 245, 238, 0.7) 100%)',
        '--card-front-border': 'rgba(120, 200, 180, 0.35)',
        '--card-front-shadow': '0 12px 35px rgba(55, 110, 95, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        '--card-front-hover-border': 'rgba(120, 200, 180, 0.6)',
        '--card-front-hover-shadow': '0 15px 50px rgba(120, 200, 180, 0.2), 0 0 30px rgba(170, 230, 210, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        '--card-back-bg': 'linear-gradient(145deg, rgba(255, 255, 255, 0.75) 0%, rgba(235, 250, 245, 0.75) 60%, rgba(220, 245, 238, 0.7) 100%)',
        '--card-back-border': 'rgba(120, 200, 180, 0.4)',
        '--card-back-shadow': '0 12px 35px rgba(55, 110, 95, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        '--day-number-gradient': 'linear-gradient(180deg, #5a9e8f 0%, #72b5a5 100%)',
        '--day-label-color': 'rgba(55, 110, 95, 0.6)',
        '--reward-title': '#5a9e8f',
        '--reward-desc': 'rgba(55, 110, 95, 0.75)',
        '--coupon-badge-bg': 'linear-gradient(135deg, #a0dece, #78c8b4)',
        '--instructions-bg': 'rgba(235, 250, 245, 0.75)',
        '--instructions-border': 'rgba(120, 200, 180, 0.3)',
        '--instructions-text': 'rgba(55, 110, 95, 0.8)',
        '--coupon-overlay-bg': 'rgba(10, 10, 20, 0.75)',
        '--coupon-card-bg': 'linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(235, 250, 245, 0.92) 100%)',
        '--coupon-card-border': 'rgba(120, 200, 180, 0.6)',
        '--coupon-card-shadow': '0 15px 50px rgba(120, 200, 180, 0.18), 0 0 30px rgba(170, 230, 210, 0.12)',
        '--coupon-title': '#5a9e8f',
        '--coupon-text': 'rgba(55, 110, 95, 0.85)',
        '--coupon-text-font': "'Nunito', sans-serif",
        '--coupon-title-secondary': 'rgba(55, 110, 95, 0.85)',
        '--locked-label': 'rgba(55, 110, 95, 0.8)',
        '--locked-label-bg': 'rgba(0, 0, 0, 0.15)'
    }
};

const PICKLE_PALETTES = {
    pickle_portal: {
        '--bg-gradient': 'linear-gradient(135deg, #ffffff 0%, #ffffff 100%)',
        '--bg-spots': 'radial-gradient(ellipse at 50% 45%, rgba(57, 200, 20, 0.12) 0%, transparent 50%), none, none',
        '--text-main': '#1a2e1a',
        '--title-gradient-color': '#1a8a10',
        '--subtitle-color': 'rgba(30, 120, 20, 0.8)',
        '--progress-color': 'rgba(30, 120, 20, 0.7)',
        '--panel-bg': 'rgba(255, 255, 255, 0.85)',
        '--panel-border': 'rgba(40, 160, 30, 0.35)',
        '--panel-shadow': '0 4px 15px rgba(40, 160, 30, 0.08)',
        '--panel-name': '#1a8a10',
        '--panel-text': 'rgba(30, 80, 25, 0.7)',
        '--fab-border': 'rgba(40, 160, 30, 0.35)',
        '--fab-bg': 'rgba(255, 255, 255, 0.9)',
        '--fab-color': '#1a8a10',
        '--fab-shadow': '0 4px 15px rgba(40, 160, 30, 0.08)',
        '--info-overlay-bg': 'rgba(0, 0, 0, 0.5)',
        '--info-card-bg': 'rgba(255, 255, 255, 0.95)',
        '--info-card-border': 'rgba(40, 160, 30, 0.3)',
        '--info-card-shadow': '0 10px 30px rgba(0, 0, 0, 0.15)',
        '--info-title': '#1a8a10',
        '--info-label': '#1a8a10',
        '--info-row': 'rgba(30, 80, 25, 0.75)',
        '--info-close-border': 'rgba(40, 160, 30, 0.35)',
        '--info-close-bg': 'rgba(255, 255, 255, 0.9)',
        '--info-close-color': '#1a8a10',
        '--card-front-bg': 'linear-gradient(145deg, rgba(255, 255, 255, 0.8) 0%, rgba(240, 255, 240, 0.7) 60%, rgba(230, 250, 230, 0.65) 100%)',
        '--card-front-border': 'rgba(40, 160, 30, 0.25)',
        '--card-front-shadow': '0 4px 12px rgba(0, 0, 0, 0.08)',
        '--card-front-hover-border': 'rgba(40, 160, 30, 0.5)',
        '--card-front-hover-shadow': '0 4px 12px rgba(0, 0, 0, 0.08)',
        '--card-back-bg': 'linear-gradient(145deg, rgba(255, 255, 255, 0.8) 0%, rgba(240, 255, 240, 0.7) 60%, rgba(230, 250, 230, 0.65) 100%)',
        '--card-back-border': 'rgba(40, 160, 30, 0.3)',
        '--card-back-shadow': '0 4px 12px rgba(0, 0, 0, 0.08)',
        '--day-number-gradient': 'linear-gradient(180deg, #1a8a10 0%, #1a8a10 100%)',
        '--day-number-color': '#1a8a10',
        '--day-label-color': 'rgba(30, 120, 20, 0.5)',
        '--reward-title': '#1a8a10',
        '--reward-desc': 'rgba(30, 80, 25, 0.7)',
        '--coupon-badge-bg': 'linear-gradient(135deg, #5cc450, #3aa830)',
        '--instructions-bg': 'rgba(240, 255, 240, 0.6)',
        '--instructions-border': 'rgba(40, 160, 30, 0.2)',
        '--instructions-text': 'rgba(30, 120, 20, 0.7)',
        '--coupon-overlay-bg': 'rgba(0, 0, 0, 0.6)',
        '--coupon-card-bg': 'linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(240, 255, 240, 0.92) 100%)',
        '--coupon-card-border': 'rgba(40, 160, 30, 0.4)',
        '--coupon-card-shadow': '0 10px 30px rgba(0, 0, 0, 0.12)',
        '--coupon-title': '#1a8a10',
        '--coupon-text': 'rgba(30, 80, 25, 0.85)',
        '--coupon-text-font': "'Russo One', sans-serif",
        '--coupon-title-secondary': '#1a8a10',
        '--locked-label': 'rgba(30, 80, 25, 0.6)',
        '--locked-label-bg': 'rgba(0, 0, 0, 0.1)'
    },

    pickle_morty: {
        '--bg-gradient': 'linear-gradient(135deg, #ffffff 0%, #ffffff 100%)',
        '--bg-spots': 'radial-gradient(ellipse at 50% 45%, rgba(255, 200, 50, 0.12) 0%, transparent 50%), none, none',
        '--text-main': '#2e2210',
        '--title-gradient-color': '#d48a00',
        '--subtitle-color': 'rgba(170, 110, 10, 0.8)',
        '--progress-color': 'rgba(170, 110, 10, 0.7)',
        '--panel-bg': 'rgba(255, 255, 255, 0.85)',
        '--panel-border': 'rgba(220, 160, 30, 0.4)',
        '--panel-shadow': '0 4px 15px rgba(220, 160, 30, 0.08)',
        '--panel-name': '#d48a00',
        '--panel-text': 'rgba(130, 85, 10, 0.7)',
        '--fab-border': 'rgba(220, 160, 30, 0.4)',
        '--fab-bg': 'rgba(255, 255, 255, 0.9)',
        '--fab-color': '#d48a00',
        '--fab-shadow': '0 4px 15px rgba(220, 160, 30, 0.08)',
        '--info-overlay-bg': 'rgba(0, 0, 0, 0.5)',
        '--info-card-bg': 'rgba(255, 255, 255, 0.95)',
        '--info-card-border': 'rgba(220, 160, 30, 0.3)',
        '--info-card-shadow': '0 10px 30px rgba(0, 0, 0, 0.15)',
        '--info-title': '#d48a00',
        '--info-label': '#d48a00',
        '--info-row': 'rgba(130, 85, 10, 0.75)',
        '--info-close-border': 'rgba(220, 160, 30, 0.4)',
        '--info-close-bg': 'rgba(255, 255, 255, 0.9)',
        '--info-close-color': '#d48a00',
        '--card-front-bg': 'linear-gradient(145deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 250, 235, 0.7) 60%, rgba(255, 245, 220, 0.65) 100%)',
        '--card-front-border': 'rgba(220, 160, 30, 0.25)',
        '--card-front-shadow': '0 4px 12px rgba(0, 0, 0, 0.08)',
        '--card-front-hover-border': 'rgba(220, 160, 30, 0.5)',
        '--card-front-hover-shadow': '0 4px 12px rgba(0, 0, 0, 0.08)',
        '--card-back-bg': 'linear-gradient(145deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 250, 235, 0.7) 60%, rgba(255, 245, 220, 0.65) 100%)',
        '--card-back-border': 'rgba(220, 160, 30, 0.3)',
        '--card-back-shadow': '0 4px 12px rgba(0, 0, 0, 0.08)',
        '--day-number-gradient': 'linear-gradient(180deg, #d48a00 0%, #d48a00 100%)',
        '--day-number-color': '#d48a00',
        '--day-label-color': 'rgba(170, 110, 10, 0.5)',
        '--reward-title': '#d48a00',
        '--reward-desc': 'rgba(130, 85, 10, 0.7)',
        '--coupon-badge-bg': 'linear-gradient(135deg, #f0c040, #e0a020)',
        '--instructions-bg': 'rgba(255, 250, 235, 0.6)',
        '--instructions-border': 'rgba(220, 160, 30, 0.2)',
        '--instructions-text': 'rgba(170, 110, 10, 0.7)',
        '--coupon-overlay-bg': 'rgba(0, 0, 0, 0.6)',
        '--coupon-card-bg': 'linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 250, 235, 0.92) 100%)',
        '--coupon-card-border': 'rgba(220, 160, 30, 0.4)',
        '--coupon-card-shadow': '0 10px 30px rgba(0, 0, 0, 0.12)',
        '--coupon-title': '#d48a00',
        '--coupon-text': 'rgba(130, 85, 10, 0.85)',
        '--coupon-text-font': "'Russo One', sans-serif",
        '--coupon-title-secondary': '#d48a00',
        '--locked-label': 'rgba(130, 85, 10, 0.6)',
        '--locked-label-bg': 'rgba(0, 0, 0, 0.1)'
    }
};

const PICKLE_VARS = {
    '--bg-gradient': 'linear-gradient(135deg, #0a0a0a 0%, #0d1117 40%, #0a0f0a 100%)',
    '--bg-spots': 'radial-gradient(ellipse at 50% 40%, rgba(57, 255, 20, 0.06) 0%, transparent 50%), none, none',
    '--text-main': '#c8ffc8',
    '--title-gradient-color': '#39ff14',
    '--subtitle-color': 'rgba(57, 255, 20, 0.7)',
    '--progress-color': 'rgba(57, 255, 20, 0.7)',
    '--panel-bg': 'rgba(10, 20, 10, 0.7)',
    '--panel-border': 'rgba(57, 255, 20, 0.35)',
    '--panel-shadow': '0 0 15px rgba(57, 255, 20, 0.1)',
    '--panel-name': '#39ff14',
    '--panel-text': 'rgba(200, 255, 200, 0.7)',
    '--fab-border': 'rgba(57, 255, 20, 0.4)',
    '--fab-bg': 'rgba(10, 20, 10, 0.9)',
    '--fab-color': '#39ff14',
    '--fab-shadow': '0 0 10px rgba(57, 255, 20, 0.1)',
    '--info-overlay-bg': 'rgba(0, 0, 0, 0.75)',
    '--info-card-bg': 'rgba(10, 20, 10, 0.95)',
    '--info-card-border': 'rgba(57, 255, 20, 0.3)',
    '--info-card-shadow': '0 0 20px rgba(57, 255, 20, 0.1)',
    '--info-title': '#39ff14',
    '--info-label': '#39ff14',
    '--info-row': 'rgba(200, 255, 200, 0.75)',
    '--info-close-border': 'rgba(57, 255, 20, 0.4)',
    '--info-close-bg': 'rgba(10, 20, 10, 0.9)',
    '--info-close-color': '#39ff14',
    '--card-front-bg': 'linear-gradient(145deg, rgba(10, 25, 10, 0.7) 0%, rgba(15, 30, 15, 0.6) 50%, rgba(10, 20, 10, 0.7) 100%)',
    '--card-front-border': 'rgba(57, 255, 20, 0.25)',
    '--card-front-shadow': '0 4px 12px rgba(0, 0, 0, 0.3)',
    '--card-front-hover-border': 'rgba(57, 255, 20, 0.6)',
    '--card-front-hover-shadow': '0 4px 12px rgba(0, 0, 0, 0.3)',
    '--card-back-bg': 'linear-gradient(145deg, rgba(10, 25, 10, 0.7) 0%, rgba(15, 30, 15, 0.6) 50%, rgba(10, 20, 10, 0.7) 100%)',
    '--card-back-border': 'rgba(57, 255, 20, 0.35)',
    '--card-back-shadow': '0 4px 12px rgba(0, 0, 0, 0.3)',
    '--day-number-gradient': 'linear-gradient(180deg, #39ff14 0%, #39ff14 100%)',
    '--day-number-color': '#39ff14',
    '--day-label-color': 'rgba(57, 255, 20, 0.5)',
    '--reward-title': '#39ff14',
    '--reward-desc': 'rgba(200, 255, 200, 0.7)',
    '--coupon-badge-bg': 'linear-gradient(135deg, #39ff14, #20cc00)',
    '--instructions-bg': 'rgba(10, 25, 10, 0.5)',
    '--instructions-border': 'rgba(57, 255, 20, 0.2)',
    '--instructions-text': 'rgba(57, 255, 20, 0.7)',
    '--coupon-overlay-bg': 'rgba(0, 0, 0, 0.8)',
    '--coupon-card-bg': 'linear-gradient(135deg, rgba(10, 25, 10, 0.95) 0%, rgba(15, 35, 15, 0.9) 100%)',
    '--coupon-card-border': 'rgba(57, 255, 20, 0.5)',
    '--coupon-card-shadow': '0 0 20px rgba(57, 255, 20, 0.1)',
    '--coupon-title': '#39ff14',
    '--coupon-text': 'rgba(200, 255, 200, 0.85)',
    '--coupon-text-font': "'Bangers', cursive",
    '--coupon-title-secondary': '#80ff60',
    '--locked-label': 'rgba(200, 255, 200, 0.6)',
    '--locked-label-bg': 'rgba(0, 0, 0, 0.5)'
};

function applyVars(vars) {
    Object.entries(vars).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
    });
}

function clearInlineVars() {
    document.documentElement.removeAttribute('style');
}

function applyStyle(style, picklePalette) {
    if (style === 'pickle') {
        document.body.classList.add('theme-pickle');
        const pp = picklePalette || localStorage.getItem('debugPicklePalette');
        if (pp && PICKLE_PALETTES[pp]) {
            applyVars(PICKLE_PALETTES[pp]);
        } else {
            applyVars(PICKLE_VARS);
        }
    } else {
        document.body.classList.remove('theme-pickle');
        clearInlineVars();
        const savedPalette = localStorage.getItem('debugPalette');
        if (savedPalette && DEBUG_PALETTES[savedPalette]) {
            applyVars(DEBUG_PALETTES[savedPalette]);
        } else {
            loadTheme().catch(() => {});
        }
    }
}

/* === Игровая модалка === */
const gameOverlay = document.getElementById('gameOverlay');
const gameContent = document.getElementById('gameContent');

function openGameModal(gameId) {
    if (!gameOverlay || !gameContent) return;
    gameContent.innerHTML = '';
    document.body.classList.add('game-open');
    gameOverlay.setAttribute('aria-hidden', 'false');

    const games = { coin: startCoinGame };
    const gameFn = games[gameId];
    if (gameFn) {
        gameFn(gameContent, {
            onResult: function() {
                closeGameModal();
            }
        });
    }
}

function closeGameModal() {
    document.body.classList.remove('game-open');
    if (gameOverlay) gameOverlay.setAttribute('aria-hidden', 'true');
    if (gameContent) gameContent.innerHTML = '';
}

if (gameOverlay) {
    gameOverlay.addEventListener('click', function(e) {
        if (e.target === gameOverlay) closeGameModal();
    });
}

/* Эффект матрицы для дня 3 */
function applyDay3MatrixEffect() {
    document.querySelectorAll('.matrix-rain').forEach(el => el.remove());
    document.body.classList.add('day3-matrix');
    const card3 = document.querySelector('.day-card[data-day="3"]');
    if (card3) {
        const front = card3.querySelector('.card-front');
        if (front) {
            const rain = document.createElement('div');
            rain.className = 'matrix-rain';
            for (let c = 0; c < 5; c++) {
                const col = document.createElement('div');
                col.className = 'matrix-col';
                let digits = '';
                for (let i = 0; i < 40; i++) {
                    digits += Math.floor(Math.random() * 10) + '\n';
                }
                col.textContent = digits;
                col.style.animationDelay = (c * 0.3) + 's';
                col.style.animationDuration = (1.5 + Math.random() * 1) + 's';
                rain.appendChild(col);
            }
            front.appendChild(rain);
        }
    }
}

const debugSelect = document.getElementById('debugMenuSelect');
if (debugSelect) {
    const savedStyle = localStorage.getItem('debugStyle') || 'default';
    if (savedStyle === 'pickle') {
        applyStyle('pickle');
    } else {
        const savedPalette = localStorage.getItem('debugPalette');
        if (savedPalette && DEBUG_PALETTES[savedPalette]) {
            debugSelect.value = savedPalette;
            applyVars(DEBUG_PALETTES[savedPalette]);
        }
    }

    debugSelect.addEventListener('change', () => {
        const chosen = debugSelect.value;

        // Игры
        if (chosen === '__game_coin') {
            debugSelect.value = '';
            openGameModal('coin');
            return;
        }

        if (chosen && chosen.startsWith('__date_')) {
            const dateCmd = chosen.replace('__date_', '');
            if (dateCmd === 'real') {
                localStorage.removeItem('adventDebugDate');
            } else {
                const dayOffset = Number(dateCmd) - 1;
                const start = new Date(START_DATE + 'T00:00:00');
                start.setDate(start.getDate() + dayOffset);
                const yyyy = start.getFullYear();
                const mm = String(start.getMonth() + 1).padStart(2, '0');
                const dd = String(start.getDate()).padStart(2, '0');
                localStorage.setItem('adventDebugDate', `${yyyy}-${mm}-${dd}`);
            }
            debugSelect.value = '';
            updateLockState();
            return;
        }

        if (chosen === '__reset') {
            debugSelect.value = '';
            if (confirm('Сбросить весь прогресс? Все открытые дни и купоны будут потеряны.')) {
                localStorage.removeItem('adventProgress');
                localStorage.removeItem('adventTryAgain');
                localStorage.removeItem('adventDebugDate');
                location.reload();
            }
            return;
        }

        if (chosen === '__style_pickle') {
            localStorage.setItem('debugStyle', 'pickle');
            localStorage.removeItem('debugPicklePalette');
            clearInlineVars();
            applyStyle('pickle');
            debugSelect.value = '';
            return;
        }
        if (chosen === '__style_default') {
            localStorage.setItem('debugStyle', 'default');
            localStorage.removeItem('debugPicklePalette');
            applyStyle('default');
            debugSelect.value = '';
            return;
        }

        if (chosen && PICKLE_PALETTES[chosen]) {
            localStorage.setItem('debugStyle', 'pickle');
            localStorage.setItem('debugPicklePalette', chosen);
            clearInlineVars();
            applyStyle('pickle', chosen);
            debugSelect.value = '';
            return;
        }

        if (chosen && DEBUG_PALETTES[chosen]) {
            localStorage.setItem('debugStyle', 'default');
            localStorage.removeItem('debugPicklePalette');
            document.body.classList.remove('theme-pickle');
            clearInlineVars();
            applyVars(DEBUG_PALETTES[chosen]);
            localStorage.setItem('debugPalette', chosen);
        }
    });
}

/* ===== /DEBUG MENU ===== */

// Load theme from JSON if no palette or pickle style saved
const _savedStyle = localStorage.getItem('debugStyle') || 'default';
if (_savedStyle !== 'pickle' && !localStorage.getItem('debugPalette')) {
    loadTheme().catch(() => {});
}

loadInfo()
    .then((data) => {
        if (!infoList) {
            return;
        }
        if (infoTitle) {
            infoTitle.textContent = data.title || 'Справка';
        }
        infoList.innerHTML = data.items.map((item) => `
            <div class="info-row">
                <div class="info-label">${item.term}</div>
                <div>${item.description}</div>
            </div>
        `).join('');
    })
    .catch(() => {
        if (infoList) {
            infoList.innerHTML = '<div class="info-row"><div class="info-label">Справка</div><div>Не удалось загрузить данные.</div></div>';
        }
    });

loadRewards()
    .then(async (data) => {
        if (data.page) {
            if (pageTitle) {
                pageTitle.textContent = data.page.title || pageTitle.textContent;
            }
            if (pageSubtitle) {
                pageSubtitle.textContent = data.page.subtitle || pageSubtitle.textContent;
            }
            if (instructionsText) {
                instructionsText.textContent = data.page.instructions || instructionsText.textContent;
            }
        }
        rewards = data.items
            .slice()
            .sort((a, b) => a.slot - b.slot);
        loadLocalProgress();
        renderRewards(rewards);
        applyDay3MatrixEffect();
    })
    .catch(() => {
        if (instructionsText) {
            instructionsText.textContent = 'Не удалось загрузить список подарков. Откройте страницу через локальный сервер.';
        }
    });

couponCard.addEventListener('click', () => {
    if (!pendingCouponOpen) {
        setCouponOpen(false);
        return;
    }

    const { card, dayNumber, reward } = pendingCouponOpen;
    pendingCouponOpen = null;
    setCouponOpen(false);
    markDayOpened(card, dayNumber, reward);
});
