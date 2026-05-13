/* === Snow & Confetti Effects === */

const snowCanvas = document.getElementById('snowCanvas');
const confettiCanvas = document.getElementById('confettiCanvas');
const snowCtx = snowCanvas ? snowCanvas.getContext('2d') : null;
const confettiCtx = confettiCanvas.getContext('2d');

const snowParticles = [];

function resizeSnowCanvas() {
    if (!snowCanvas || !snowCtx) {
        return;
    }
    const ratio = window.devicePixelRatio || 1;
    snowCanvas.width = Math.floor(window.innerWidth * ratio);
    snowCanvas.height = Math.floor(window.innerHeight * ratio);
    snowCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function initSnow() {
    if (!snowCanvas || !snowCtx) {
        return;
    }
    snowParticles.length = 0;
    const count = Math.min(160, Math.max(90, Math.floor(window.innerWidth / 8)));
    for (let i = 0; i < count; i += 1) {
        snowParticles.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            radius: 1 + Math.random() * 2.5,
            speed: 0.4 + Math.random() * 1.2,
            drift: (Math.random() - 0.5) * 0.6,
            opacity: 0.5
        });
    }
}

function animateSnow() {
    if (!snowCanvas || !snowCtx) {
        return;
    }
    snowCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    snowParticles.forEach((flake) => {
        flake.y += flake.speed;
        flake.x += flake.drift;
        if (flake.y > window.innerHeight + 10) {
            flake.y = -10;
            flake.x = Math.random() * window.innerWidth;
        }
        if (flake.x > window.innerWidth + 10) {
            flake.x = -10;
        } else if (flake.x < -10) {
            flake.x = window.innerWidth + 10;
        }
        snowCtx.beginPath();
        snowCtx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        snowCtx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
        snowCtx.fill();
    });
    requestAnimationFrame(animateSnow);
}

function resizeConfettiCanvas() {
    const ratio = window.devicePixelRatio || 1;
    confettiCanvas.width = Math.floor(window.innerWidth * ratio);
    confettiCanvas.height = Math.floor(window.innerHeight * ratio);
    confettiCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function launchConfetti() {
    resizeConfettiCanvas();
    const colors = ['#f6e7b2', '#f4d06f', '#f472b6', '#93c5fd', '#facc15'];
    const particles = Array.from({ length: 140 }, () => ({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.8) * 12,
        size: 6 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI
    }));

    let start = null;
    function tick(timestamp) {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        particles.forEach((p) => {
            p.vy += 0.2;
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += 0.2;

            confettiCtx.save();
            confettiCtx.translate(p.x, p.y);
            confettiCtx.rotate(p.rotation);
            confettiCtx.fillStyle = p.color;
            confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
            confettiCtx.restore();
        });

        if (elapsed < 1200) {
            requestAnimationFrame(tick);
        } else {
            confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        }
    }
    requestAnimationFrame(tick);
}

window.addEventListener('resize', () => {
    resizeConfettiCanvas();
    resizeSnowCanvas();
    initSnow();
});

resizeSnowCanvas();
initSnow();
animateSnow();
