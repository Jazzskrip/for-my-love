/* === Day 3: Hacker Attack === */

function startDay3HackerGame(container, { onResult }) {
    // Hide all calendar cards except day 3
    var allCards = document.querySelectorAll('.day-card');
    allCards.forEach(function (card) {
        if (card.dataset.day !== '3') {
            card.style.transition = 'opacity 0.5s, transform 0.5s';
            card.style.opacity = '0';
            card.style.transform = 'scale(0.8)';
            card.style.pointerEvents = 'none';
        }
    });

    // Create fullscreen overlay (not yet in DOM)
    var overlay = document.createElement('div');
    overlay.className = 'hacker-overlay';

    var canvas = document.createElement('canvas');
    canvas.className = 'hacker-matrix-canvas';
    overlay.appendChild(canvas);

    var center = document.createElement('div');
    center.className = 'hacker-center';
    overlay.appendChild(center);

    var terminal = document.createElement('div');
    terminal.className = 'hacker-terminal';
    center.appendChild(terminal);

    var videoWrap = document.createElement('div');
    videoWrap.className = 'hacker-video-wrap';
    center.appendChild(videoWrap);

    var timerEl = document.createElement('div');
    timerEl.className = 'hacker-timer';
    center.appendChild(timerEl);

    // Matrix rain state
    var ctx = canvas.getContext('2d');
    var columns = [];
    var matrixChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*(){}[]|;:<>/?~';
    var fontSize = 14;
    var matrixRunning = false;

    function resizeCanvas() {
        var dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(window.innerWidth * dpr);
        canvas.height = Math.floor(window.innerHeight * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        var colCount = Math.floor(window.innerWidth / fontSize);
        columns = [];
        for (var i = 0; i < colCount; i++) {
            columns.push(Math.random() * -100);
        }
    }

    function drawMatrix() {
        if (!matrixRunning) return;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.fillStyle = '#39ff14';
        ctx.font = fontSize + 'px monospace';

        for (var i = 0; i < columns.length; i++) {
            var char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
            var x = i * fontSize;
            var y = columns[i] * fontSize;

            ctx.globalAlpha = 0.4 + Math.random() * 0.3;
            ctx.fillText(char, x, y);
            ctx.globalAlpha = 1;

            if (y > window.innerHeight && Math.random() > 0.975) {
                columns[i] = 0;
            }
            columns[i]++;
        }
        requestAnimationFrame(drawMatrix);
    }

    var resizeHandler = function () { resizeCanvas(); };

    // === Terminal typing ===
    var terminalLines = [
        '> connecting to remote server...',
        '> access granted.',
        '> scanning system files...',
        '> WARNING: malware detected!',
        '> threat level: CRITICAL',
        '> initializing quarantine protocol...',
        '> loading visual evidence...'
    ];

    function typeLine(text, callback) {
        var line = document.createElement('div');
        line.className = 'hacker-terminal-line';
        terminal.appendChild(line);

        var cursor = document.createElement('span');
        cursor.className = 'hacker-terminal-cursor';

        var charIndex = 0;
        var interval = setInterval(function () {
            if (charIndex < text.length) {
                line.textContent = text.substring(0, charIndex + 1);
                line.appendChild(cursor);
                charIndex++;
            } else {
                clearInterval(interval);
                if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
                if (callback) callback();
            }
        }, 30 + Math.random() * 20);
    }

    function typeSequence(lines, index, callback) {
        if (index >= lines.length) {
            if (callback) callback();
            return;
        }
        typeLine(lines[index], function () {
            setTimeout(function () {
                typeSequence(lines, index + 1, callback);
            }, 200 + Math.random() * 300);
        });
    }

    // === Video phase ===
    function showVideo() {
        terminal.style.transition = 'opacity 0.5s';
        terminal.style.opacity = '0';

        setTimeout(function () {
            terminal.style.display = 'none';

            var inner = document.createElement('div');
            inner.className = 'hacker-video-inner';
            var iframe = document.createElement('iframe');
            iframe.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0';
            iframe.setAttribute('allow', 'autoplay; encrypted-media');
            iframe.setAttribute('allowfullscreen', '');
            inner.appendChild(iframe);
            videoWrap.appendChild(inner);

            requestAnimationFrame(function () {
                videoWrap.classList.add('visible');
            });

            var remaining = 10;
            timerEl.textContent = remaining;

            var countdown = setInterval(function () {
                remaining--;
                timerEl.textContent = remaining > 0 ? remaining : '';
                if (remaining <= 0) {
                    clearInterval(countdown);
                    hideVideoShowButton();
                }
            }, 1000);
        }, 500);
    }

    // === Button phase ===
    function hideVideoShowButton() {
        videoWrap.style.transition = 'opacity 0.5s, transform 0.5s';
        videoWrap.style.opacity = '0';
        videoWrap.style.transform = 'scale(0.9)';

        setTimeout(function () {
            videoWrap.innerHTML = '';
            videoWrap.style.display = 'none';
            timerEl.style.display = 'none';

            var btn = document.createElement('button');
            btn.className = 'hacker-btn';
            btn.textContent = 'Удалить вирусы';
            center.appendChild(btn);

            btn.addEventListener('click', function () {
                cleanup();
                onResult('win');
            });
        }, 500);
    }

    // === Cleanup ===
    function cleanup() {
        matrixRunning = false;
        window.removeEventListener('resize', resizeHandler);

        overlay.classList.remove('active');
        setTimeout(function () {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 600);

        allCards.forEach(function (card) {
            card.style.transition = 'opacity 0.5s, transform 0.5s';
            card.style.opacity = '';
            card.style.transform = '';
            card.style.pointerEvents = '';
        });
    }

    // === Start: wait for cards to disappear, then show overlay ===
    setTimeout(function () {
        document.body.appendChild(overlay);
        resizeCanvas();
        matrixRunning = true;
        drawMatrix();
        window.addEventListener('resize', resizeHandler);

        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                overlay.classList.add('active');
            });
        });

        setTimeout(function () {
            typeSequence(terminalLines, 0, function () {
                showVideo();
            });
        }, 800);
    }, 700);
}
