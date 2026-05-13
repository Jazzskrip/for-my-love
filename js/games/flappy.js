/* === Flappy Bird === */

function startFlappyGame(container, { onResult }) {
    container.innerHTML = '';

    var wrapper = document.createElement('div');
    wrapper.className = 'flappy-game';

    var canvas = document.createElement('canvas');
    canvas.className = 'flappy-canvas';
    wrapper.appendChild(canvas);

    var scoreEl = document.createElement('div');
    scoreEl.className = 'flappy-score';
    scoreEl.textContent = '0 / 5';
    wrapper.appendChild(scoreEl);

    var msgEl = document.createElement('div');
    msgEl.className = 'flappy-msg';
    wrapper.appendChild(msgEl);

    container.appendChild(wrapper);

    // Картинки
    var birdImg = new Image();
    birdImg.src = 'img/flappy-bird.png';
    var burgerImg = new Image();
    burgerImg.src = 'img/flappy-burger.png';

    // Размеры canvas
    var maxH = window.innerHeight - 160;
    var W = Math.min(container.clientWidth - 16, 500);
    var H = Math.min(Math.round(W * 1.5), maxH);
    var dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Константы (нормализованы под 60fps, dt=1.0)
    var TARGET_DT = 1000 / 60;
    var GRAVITY = 0.35;
    var JUMP = -6;
    var PIPE_WIDTH = 48;
    var PIPE_GAP = 150;
    var PIPE_SPEED = 2.2;
    var BIRD_SIZE = 24;
    var PIPES_TO_WIN = 5;
    var PIPE_SPACING = 240;
    var BIRD_IMG_W = 48;
    var BIRD_IMG_H = 104;
    var BURGER_W = 480;
    var BURGER_H = 360;

    // Состояние
    var bird, pipes, score, gameOver, gameWon, started, animId, lastTime;
    var burgerPhase; // false = не показан, true = бургер на экране
    var burgerX;

    function reset() {
        bird = { x: W * 0.25, y: H * 0.4, vy: 0, rotation: 0 };
        pipes = [];
        score = 0;
        gameOver = false;
        gameWon = false;
        started = false;
        lastTime = 0;
        burgerPhase = false;
        burgerX = -1;
        scoreEl.textContent = '0 / ' + PIPES_TO_WIN;
        msgEl.innerHTML = '';
        msgEl.className = 'flappy-msg';

        // Создаём ровно 5 труб заранее
        for (var i = 0; i < PIPES_TO_WIN; i++) {
            var minTop = 60;
            var maxTop = H - PIPE_GAP - 60;
            var topH = minTop + Math.random() * (maxTop - minTop);
            pipes.push({
                x: W + 80 + i * PIPE_SPACING,
                topH: topH,
                scored: false
            });
        }

        // Бургер появится за последней трубой
        var lastPipe = pipes[pipes.length - 1];
        burgerX = lastPipe.x + PIPE_SPACING;
        BURGER_SURFACE_Y = H - BURGER_H + BURGER_SURFACE_OFFSET;
    }

    function jump() {
        if (gameOver || gameWon) return;
        if (!started) started = true;
        bird.vy = JUMP;
    }

    function checkCollision(pipe) {
        var bx = bird.x;
        var by = bird.y;
        var r = BIRD_SIZE / 2;
        if (bx + r > pipe.x && bx - r < pipe.x + PIPE_WIDTH) {
            if (by - r < pipe.topH) return true;
            if (by + r > pipe.topH + PIPE_GAP) return true;
        }
        return false;
    }

    // Поверхность бургера — тонкая платформа
    // Картинка 480x360, ~30% сверху прозрачные, булка начинается ≈ на 30% от верха
    var BURGER_SURFACE_OFFSET = Math.round(BURGER_H * 0.45);
    var BURGER_SURFACE_Y = 0; // вычислится в reset()

    function isBirdOverBurger() {
        var hitLeft = burgerX + 30;
        var hitRight = burgerX + BURGER_W - 30;
        return bird.x > hitLeft && bird.x < hitRight;
    }

    function update(dt) {
        if (!started || gameOver || gameWon) return;

        bird.vy += GRAVITY * dt;
        bird.y += bird.vy * dt;
        bird.rotation = Math.min(bird.vy * 3, 45);

        // Потолок
        if (bird.y - BIRD_SIZE / 2 < 0) {
            bird.y = BIRD_SIZE / 2;
            bird.vy = 0;
        }

        // Проверяем: все трубы пройдены?
        var allScored = score >= PIPES_TO_WIN;

        if (allScored) {
            burgerPhase = true;
        }

        // Бургер как платформа — птичка приземляется на поверхность булки
        if (burgerPhase && bird.vy > 0 && isBirdOverBurger()) {
            var birdBottom = bird.y + BIRD_IMG_H / 2;
            if (birdBottom >= BURGER_SURFACE_Y) {
                bird.y = BURGER_SURFACE_Y - BIRD_IMG_H / 2;
                bird.vy = 0;
                win();
                return;
            }
        }

        // Пол = смерть
        if (bird.y + BIRD_SIZE / 2 > H) {
            bird.y = H - BIRD_SIZE / 2;
            die();
            return;
        }

        // Двигаем трубы и бургер
        var pipeMove = PIPE_SPEED * dt;
        burgerX -= pipeMove;

        for (var i = pipes.length - 1; i >= 0; i--) {
            pipes[i].x -= pipeMove;

            if (checkCollision(pipes[i])) {
                die();
                return;
            }

            if (!pipes[i].scored && pipes[i].x + PIPE_WIDTH < bird.x) {
                pipes[i].scored = true;
                score++;
                scoreEl.textContent = score + ' / ' + PIPES_TO_WIN;
            }

            if (pipes[i].x + PIPE_WIDTH < -10) {
                pipes.splice(i, 1);
            }
        }
    }

    function drawBird() {
        ctx.save();
        ctx.translate(bird.x, bird.y);
        ctx.rotate(bird.rotation * Math.PI / 180);
        if (birdImg.complete && birdImg.naturalWidth > 0) {
            ctx.drawImage(birdImg, -BIRD_IMG_W / 2, -BIRD_IMG_H / 2, BIRD_IMG_W, BIRD_IMG_H);
        } else {
            ctx.fillStyle = '#e8607a';
            ctx.beginPath();
            ctx.arc(0, 0, BIRD_SIZE / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    function drawPipe(pipe) {
        var radius = 6;
        ctx.fillStyle = '#7bc67e';
        roundRect(ctx, pipe.x, 0, PIPE_WIDTH, pipe.topH, 0, 0, radius, radius);
        ctx.fill();
        ctx.fillStyle = '#5aad5e';
        roundRect(ctx, pipe.x - 4, pipe.topH - 20, PIPE_WIDTH + 8, 20, radius, radius, radius, radius);
        ctx.fill();

        var bottomY = pipe.topH + PIPE_GAP;
        ctx.fillStyle = '#7bc67e';
        roundRect(ctx, pipe.x, bottomY, PIPE_WIDTH, H - bottomY, radius, radius, 0, 0);
        ctx.fill();
        ctx.fillStyle = '#5aad5e';
        roundRect(ctx, pipe.x - 4, bottomY, PIPE_WIDTH + 8, 20, radius, radius, radius, radius);
        ctx.fill();
    }

    function drawBurger() {
        if (burgerImg.complete && burgerImg.naturalWidth > 0) {
            ctx.drawImage(burgerImg, burgerX, H - BURGER_H, BURGER_W, BURGER_H);
        } else {
            ctx.fillStyle = '#d4a030';
            ctx.fillRect(burgerX, H - BURGER_H, BURGER_W, BURGER_H);
        }
    }

    function roundRect(ctx, x, y, w, h, tlr, trr, brr, blr) {
        ctx.beginPath();
        ctx.moveTo(x + tlr, y);
        ctx.lineTo(x + w - trr, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + trr);
        ctx.lineTo(x + w, y + h - brr);
        ctx.quadraticCurveTo(x + w, y + h, x + w - brr, y + h);
        ctx.lineTo(x + blr, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - blr);
        ctx.lineTo(x, y + tlr);
        ctx.quadraticCurveTo(x, y, x + tlr, y);
        ctx.closePath();
    }

    function draw() {
        var grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#87CEEB');
        grad.addColorStop(0.7, '#c8e6f5');
        grad.addColorStop(1, '#a8d8a8');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = '#8B7355';
        ctx.fillRect(0, H - 4, W, 4);

        for (var i = 0; i < pipes.length; i++) {
            drawPipe(pipes[i]);
        }

        // Бургер — рисуем всегда (он далеко за экраном пока не дойдёт)
        drawBurger();

        drawBird();
    }

    function loop(timestamp) {
        if (!lastTime) lastTime = timestamp;
        var elapsed = timestamp - lastTime;
        lastTime = timestamp;
        var dt = Math.min(elapsed / TARGET_DT, 3);
        update(dt);
        draw();
        animId = requestAnimationFrame(loop);
    }

    function die() {
        gameOver = true;
        msgEl.innerHTML = '<button class="flappy-retry-btn" type="button">Попробовать снова</button>';
        msgEl.className = 'flappy-msg flappy-msg-visible';
        msgEl.querySelector('.flappy-retry-btn').addEventListener('click', function() {
            reset();
        });
    }

    function win() {
        gameWon = true;
        scoreEl.textContent = PIPES_TO_WIN + ' / ' + PIPES_TO_WIN;
        msgEl.innerHTML = 'Ты прошёл!';
        msgEl.className = 'flappy-msg flappy-msg-visible flappy-msg-win';

        setTimeout(function() {
            cancelAnimationFrame(animId);
            if (onResult) onResult('win');
        }, 2000);
    }

    canvas.addEventListener('click', function(e) {
        e.preventDefault();
        jump();
    });

    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        jump();
    }, { passive: false });

    reset();
    loop();
}
