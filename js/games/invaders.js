/* === Space Invaders === */

function startInvadersGame(container, { onResult }) {
    container.innerHTML = '';

    var wrapper = document.createElement('div');
    wrapper.className = 'invaders-game';

    var canvas = document.createElement('canvas');
    canvas.className = 'invaders-canvas';
    wrapper.appendChild(canvas);

    var scoreEl = document.createElement('div');
    scoreEl.className = 'invaders-score';
    scoreEl.textContent = 'Осталось: 15';
    wrapper.appendChild(scoreEl);

    var msgEl = document.createElement('div');
    msgEl.className = 'invaders-msg';
    wrapper.appendChild(msgEl);

    var hintEl = document.createElement('div');
    hintEl.className = 'invaders-hint';
    hintEl.textContent = 'Управление: \u2190 \u2192 стрелочки или тач';
    wrapper.appendChild(hintEl);

    container.appendChild(wrapper);

    // --- Sizes (1.5x bigger) ---
    var W = Math.min(container.clientWidth - 16, 540);
    var H = Math.round(W * 1.4);
    var dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // --- Images ---
    var enemyImg = new Image();
    enemyImg.src = 'img/invaders-enemy.png';
    var shipImg = new Image();
    shipImg.src = 'img/invaders-ship.png';

    var imagesLoaded = 0;
    enemyImg.onload = shipImg.onload = function() {
        imagesLoaded++;
        if (imagesLoaded >= 2) init();
    };
    enemyImg.onerror = function() { imagesLoaded++; if (imagesLoaded >= 2) init(); };
    shipImg.onerror = function() { imagesLoaded++; if (imagesLoaded >= 2) init(); };

    // --- Constants ---
    var TOTAL_ENEMIES = 15;
    var ENEMY_W = 50;
    var ENEMY_H = 65;
    // Ship: quarter of original 527x473
    var SHIP_W = 132;
    var SHIP_H = 119;
    var BULLET_SPEED = 7;
    var ENEMY_SPEED = 1.5;
    var SHOOT_INTERVAL = 900;
    var SPAWN_INTERVAL = 1200;
    var TARGET_DT = 1000 / 60;

    // --- State ---
    var ship = { x: W / 2, y: H - SHIP_H / 2 - 10 };
    var bullets = [];
    var enemies = [];
    var particles = [];
    var alive = 0;
    var killed = 0;
    var spawned = 0;
    var gameOver = false;
    var lastShot = 0;
    var lastSpawn = 0;
    var lastTime = 0;
    var animId = null;
    var touching = false;

    function init() {
        // Input
        canvas.addEventListener('touchstart', onTouch, { passive: false });
        canvas.addEventListener('touchmove', onTouch, { passive: false });
        canvas.addEventListener('touchend', function() { touching = false; }, { passive: false });
        canvas.addEventListener('mousedown', function(e) { touching = true; onMouse(e); });
        canvas.addEventListener('mousemove', onMouse);
        canvas.addEventListener('mouseup', function() { touching = false; });
        document.addEventListener('keydown', onKey);
        document.addEventListener('keyup', onKeyUp);

        lastTime = performance.now();
        lastSpawn = lastTime - SPAWN_INTERVAL; // spawn first enemy immediately
        animId = requestAnimationFrame(tick);
    }

    var keysDown = {};
    function onKey(e) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            keysDown[e.key] = true;
        }
    }
    function onKeyUp(e) {
        keysDown[e.key] = false;
    }

    function onTouch(e) {
        e.preventDefault();
        touching = true;
        var rect = canvas.getBoundingClientRect();
        var tx = (e.touches[0].clientX - rect.left) * (W / rect.width);
        ship.x = Math.max(SHIP_W / 2, Math.min(W - SHIP_W / 2, tx));
    }

    function onMouse(e) {
        if (!touching) return;
        var rect = canvas.getBoundingClientRect();
        var mx = (e.clientX - rect.left) * (W / rect.width);
        ship.x = Math.max(SHIP_W / 2, Math.min(W - SHIP_W / 2, mx));
    }

    function tick(now) {
        if (gameOver) return;

        var elapsed = now - lastTime;
        lastTime = now;
        var dt = elapsed / TARGET_DT;
        if (dt > 3) dt = 3;

        update(dt, now);
        draw();
        animId = requestAnimationFrame(tick);
    }

    function spawnEnemy(now) {
        if (spawned >= TOTAL_ENEMIES) return;
        if (now - lastSpawn < SPAWN_INTERVAL) return;

        lastSpawn = now;
        spawned++;
        alive++;

        // Alternate sides: even from left, odd from right
        var fromLeft = spawned % 2 === 0;
        var startX = fromLeft ? -ENEMY_W / 2 : W + ENEMY_W / 2;
        var targetX = ENEMY_W / 2 + Math.random() * (W - ENEMY_W);
        var startY = -ENEMY_H;

        enemies.push({
            x: startX,
            y: startY,
            targetX: targetX,
            targetY: 40 + Math.random() * (H * 0.4),
            entering: true,
            alive: true,
            dir: 1,
            phase: Math.random() * Math.PI * 2
        });

        scoreEl.textContent = 'Осталось: ' + alive;
    }

    function update(dt, now) {
        // Spawn enemies one by one
        spawnEnemy(now);

        // Keyboard movement
        var SHIP_SPEED = 5;
        if (keysDown['ArrowLeft']) ship.x -= SHIP_SPEED * dt;
        if (keysDown['ArrowRight']) ship.x += SHIP_SPEED * dt;
        ship.x = Math.max(SHIP_W / 2, Math.min(W - SHIP_W / 2, ship.x));

        // Auto-shoot
        if (now - lastShot > SHOOT_INTERVAL) {
            lastShot = now;
            bullets.push({ x: ship.x, y: ship.y - SHIP_H / 2 });
            // Muzzle flash particles
            for (var p = 0; p < 5; p++) {
                particles.push({
                    x: ship.x + (Math.random() - 0.5) * 10,
                    y: ship.y - SHIP_H / 2,
                    vy: -(3 + Math.random() * 4),
                    vx: (Math.random() - 0.5) * 1.5,
                    life: 1.0,
                    decay: 0.04 + Math.random() * 0.03
                });
            }
        }

        // Move bullets
        for (var i = bullets.length - 1; i >= 0; i--) {
            bullets[i].y -= BULLET_SPEED * dt;
            if (bullets[i].y < -20) {
                bullets.splice(i, 1);
            }
        }

        // Move particles
        for (var i = particles.length - 1; i >= 0; i--) {
            var pt = particles[i];
            pt.x += pt.vx * dt;
            pt.y += pt.vy * dt;
            pt.life -= pt.decay * dt;
            if (pt.life <= 0) {
                particles.splice(i, 1);
            }
        }

        // Move enemies
        for (var i = 0; i < enemies.length; i++) {
            var en = enemies[i];
            if (!en.alive) continue;

            if (en.entering) {
                // Fly to target position
                var dxT = en.targetX - en.x;
                var dyT = en.targetY - en.y;
                var dist = Math.sqrt(dxT * dxT + dyT * dyT);
                if (dist < 3) {
                    en.entering = false;
                    en.x = en.targetX;
                    en.y = en.targetY;
                } else {
                    var spd = 3.5 * dt;
                    en.x += (dxT / dist) * spd;
                    en.y += (dyT / dist) * spd;
                }
            } else {
                // Idle sway + slow descent
                en.phase += 0.03 * dt;
                en.x += Math.sin(en.phase) * ENEMY_SPEED * dt;
                en.y += 0.3 * dt;

                // Bounce off walls
                if (en.x - ENEMY_W / 2 < 0) { en.x = ENEMY_W / 2; en.phase += Math.PI; }
                if (en.x + ENEMY_W / 2 > W) { en.x = W - ENEMY_W / 2; en.phase += Math.PI; }
            }
        }

        // Collision: bullets vs enemies
        for (var b = bullets.length - 1; b >= 0; b--) {
            for (var e = 0; e < enemies.length; e++) {
                if (!enemies[e].alive) continue;
                var dx = Math.abs(bullets[b].x - enemies[e].x);
                var dy = Math.abs(bullets[b].y - enemies[e].y);
                if (dx < (6 + ENEMY_W) / 2 && dy < (20 + ENEMY_H) / 2) {
                    enemies[e].alive = false;
                    bullets.splice(b, 1);
                    alive--;
                    killed++;
                    scoreEl.textContent = 'Осталось: ' + alive;
                    // Kill particles
                    for (var p = 0; p < 6; p++) {
                        particles.push({
                            x: enemies[e].x + (Math.random() - 0.5) * ENEMY_W,
                            y: enemies[e].y + (Math.random() - 0.5) * ENEMY_H,
                            vy: (Math.random() - 0.5) * 3,
                            vx: (Math.random() - 0.5) * 3,
                            life: 1.0,
                            decay: 0.03 + Math.random() * 0.02
                        });
                    }
                    if (killed >= TOTAL_ENEMIES) {
                        win();
                        return;
                    }
                    break;
                }
            }
        }

        // Check lose: enemies reached ship level
        for (var i = 0; i < enemies.length; i++) {
            if (!enemies[i].alive) continue;
            if (enemies[i].y + ENEMY_H / 2 >= ship.y - SHIP_H / 2) {
                lose();
                return;
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        // Background
        ctx.fillStyle = '#0b1026';
        ctx.fillRect(0, 0, W, H);

        // Stars
        drawStars();

        // Enemies
        for (var i = 0; i < enemies.length; i++) {
            if (!enemies[i].alive) continue;
            var ex = enemies[i].x - ENEMY_W / 2;
            var ey = enemies[i].y - ENEMY_H / 2;
            if (enemyImg.complete && enemyImg.naturalWidth > 0) {
                ctx.drawImage(enemyImg, ex, ey, ENEMY_W, ENEMY_H);
            } else {
                ctx.fillStyle = '#4caf50';
                ctx.fillRect(ex, ey, ENEMY_W, ENEMY_H);
            }
        }

        // Bullets — yellow elongated shape
        for (var i = 0; i < bullets.length; i++) {
            var bx = bullets[i].x;
            var by = bullets[i].y;
            // Glow
            ctx.save();
            ctx.shadowColor = '#ffeb3b';
            ctx.shadowBlur = 8;
            ctx.fillStyle = '#ffeb3b';
            ctx.beginPath();
            ctx.ellipse(bx, by, 2.5, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            // Bright core
            ctx.fillStyle = '#fff9c4';
            ctx.beginPath();
            ctx.ellipse(bx, by, 1.5, 6, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Particles (muzzle flash + kill)
        for (var i = 0; i < particles.length; i++) {
            var pt = particles[i];
            ctx.save();
            ctx.globalAlpha = pt.life;
            ctx.shadowColor = '#ffeb3b';
            ctx.shadowBlur = 6;
            ctx.fillStyle = '#ffeb3b';
            ctx.beginPath();
            ctx.ellipse(pt.x, pt.y, 1.5, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Ship
        var sx = ship.x - SHIP_W / 2;
        var sy = ship.y - SHIP_H / 2;
        if (shipImg.complete && shipImg.naturalWidth > 0) {
            ctx.drawImage(shipImg, sx, sy, SHIP_W, SHIP_H);
        } else {
            ctx.fillStyle = '#ff8a65';
            ctx.beginPath();
            ctx.moveTo(ship.x, sy);
            ctx.lineTo(sx, sy + SHIP_H);
            ctx.lineTo(sx + SHIP_W, sy + SHIP_H);
            ctx.closePath();
            ctx.fill();
        }
    }

    // Star field
    var stars = [];
    for (var i = 0; i < 60; i++) {
        stars.push({
            x: Math.random(),
            y: Math.random(),
            r: 0.5 + Math.random() * 1.5,
            a: 0.3 + Math.random() * 0.7
        });
    }

    function drawStars() {
        for (var i = 0; i < stars.length; i++) {
            var s = stars[i];
            ctx.fillStyle = 'rgba(255,255,255,' + s.a + ')';
            ctx.beginPath();
            ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function win() {
        gameOver = true;
        cleanup();
        scoreEl.textContent = '';
        hintEl.style.display = 'none';
        msgEl.textContent = 'Победа! Все враги уничтожены!';
        msgEl.className = 'invaders-msg invaders-msg-visible invaders-msg-win';
        setTimeout(function() {
            if (onResult) onResult('win');
        }, 2000);
    }

    function lose() {
        gameOver = true;
        cleanup();
        hintEl.style.display = 'none';
        msgEl.textContent = 'Враги прорвались! Попробуй ещё';
        msgEl.className = 'invaders-msg invaders-msg-visible';

        var retryBtn = document.createElement('button');
        retryBtn.className = 'invaders-retry-btn';
        retryBtn.type = 'button';
        retryBtn.textContent = 'Ещё раз';
        retryBtn.addEventListener('click', function() {
            startInvadersGame(container, { onResult: onResult });
        });
        wrapper.appendChild(retryBtn);
    }

    function cleanup() {
        if (animId) cancelAnimationFrame(animId);
        document.removeEventListener('keydown', onKey);
        document.removeEventListener('keyup', onKeyUp);
    }
}
