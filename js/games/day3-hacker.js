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
                btn.remove();
                startHackingMinigame(center, overlay, canvas, function () {
                    cleanup();
                    onResult('win');
                });
            });
        }, 500);
    }

    // === Cleanup ===
    function cleanup() {
        matrixRunning = false;
        window.removeEventListener('resize', resizeHandler);
        if (overlay._hackCleanup) overlay._hackCleanup();

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

/* === Hacking Minigame === */

function startHackingMinigame(center, overlay, matrixCanvas, onComplete) {
    center.innerHTML = '';

    // Map definition
    // Nodes: id, x, y (grid units), type
    var NODES = [
        { id: 'start',   x: 6, y: 2, type: 'node' },
        { id: 'n1',      x: 5, y: 2, type: 'node' },
        { id: 'branch1', x: 4, y: 2, type: 'node' },
        { id: 'server1', x: 4, y: 0.5, type: 'server', password: ['up', 'down', 'left'], label: 'SRV-01' },
        { id: 'n2',      x: 3, y: 2, type: 'node' },
        { id: 'branch2', x: 2, y: 2, type: 'node' },
        { id: 'server2', x: 2, y: 3.5, type: 'server', password: ['right', 'up', 'left'], label: 'SRV-02' },
        { id: 'terminal',x: 0.5, y: 2, type: 'terminal', label: 'MAIN' }
    ];

    var EDGES = [
        ['start', 'n1'],
        ['n1', 'branch1'],
        ['branch1', 'server1'],
        ['branch1', 'n2'],
        ['n2', 'branch2'],
        ['branch2', 'server2'],
        ['branch2', 'terminal']
    ];

    var FULL_PASSWORD = ['up', 'down', 'left', 'right', 'up', 'left'];
    var ARROW_SYMBOLS = { up: '↑', down: '↓', left: '←', right: '→' };

    var collectedPasswords = {};
    var currentNodeId = 'start';
    var inputMode = false;
    var inputSequence = [];
    var expectedSequence = null;

    function getNode(id) {
        for (var i = 0; i < NODES.length; i++) {
            if (NODES[i].id === id) return NODES[i];
        }
        return null;
    }

    function getNeighbors(nodeId) {
        var neighbors = [];
        for (var i = 0; i < EDGES.length; i++) {
            if (EDGES[i][0] === nodeId) neighbors.push(EDGES[i][1]);
            if (EDGES[i][1] === nodeId) neighbors.push(EDGES[i][0]);
        }
        return neighbors;
    }

    function getDirection(fromId, toId) {
        var from = getNode(fromId);
        var to = getNode(toId);
        var dx = to.x - from.x;
        var dy = to.y - from.y;
        if (Math.abs(dx) > Math.abs(dy)) return dx < 0 ? 'left' : 'right';
        return dy < 0 ? 'up' : 'down';
    }

    // Build the map UI
    var mapWrap = document.createElement('div');
    mapWrap.className = 'hack-map-wrap';
    center.appendChild(mapWrap);

    var mapArea = document.createElement('div');
    mapArea.className = 'hack-map';
    mapWrap.appendChild(mapArea);

    // Status text
    var statusEl = document.createElement('div');
    statusEl.className = 'hack-status';
    statusEl.textContent = 'Navigate to servers to collect the password';
    mapWrap.appendChild(statusEl);

    // Password display
    var passwordDisplay = document.createElement('div');
    passwordDisplay.className = 'hack-password-display';
    mapWrap.appendChild(passwordDisplay);

    // Input feedback
    var inputDisplay = document.createElement('div');
    inputDisplay.className = 'hack-input-display';
    mapWrap.appendChild(inputDisplay);

    // Arrow controls
    var controls = document.createElement('div');
    controls.className = 'hack-controls';
    var dirs = [
        { dir: 'up', symbol: '↑', gridArea: 'up' },
        { dir: 'left', symbol: '←', gridArea: 'left' },
        { dir: 'down', symbol: '↓', gridArea: 'down' },
        { dir: 'right', symbol: '→', gridArea: 'right' }
    ];
    dirs.forEach(function (d) {
        var btn = document.createElement('button');
        btn.className = 'hack-arrow-btn';
        btn.dataset.dir = d.dir;
        btn.textContent = d.symbol;
        btn.style.gridArea = d.gridArea;
        btn.addEventListener('click', function () { handleInput(d.dir); });
        controls.appendChild(btn);
    });
    mapWrap.appendChild(controls);

    // Draw edges (lines)
    EDGES.forEach(function (edge) {
        var a = getNode(edge[0]);
        var b = getNode(edge[1]);
        var line = document.createElement('div');
        line.className = 'hack-edge';
        var CELL = 52;
        var x1 = a.x * CELL, y1 = a.y * CELL;
        var x2 = b.x * CELL, y2 = b.y * CELL;
        var len = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
        var angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        line.style.width = len + 'px';
        line.style.left = (x1 + 10) + 'px';
        line.style.top = (y1 + 10) + 'px';
        line.style.transform = 'rotate(' + angle + 'deg)';
        mapArea.appendChild(line);
    });

    // Draw nodes
    var nodeEls = {};
    NODES.forEach(function (n) {
        var el = document.createElement('div');
        var CELL = 52;
        el.className = 'hack-node hack-node-' + n.type;
        el.style.left = (n.x * CELL) + 'px';
        el.style.top = (n.y * CELL) + 'px';
        if (n.label) {
            var lbl = document.createElement('span');
            lbl.className = 'hack-node-label';
            lbl.textContent = n.label;
            el.appendChild(lbl);
        }
        mapArea.appendChild(el);
        nodeEls[n.id] = el;
    });

    // Player element
    var playerEl = document.createElement('div');
    playerEl.className = 'hack-player';
    playerEl.textContent = '🤖';
    mapArea.appendChild(playerEl);

    function updatePlayerPos(animate) {
        var n = getNode(currentNodeId);
        var CELL = 52;
        var x = n.x * CELL;
        var y = n.y * CELL;
        if (animate) {
            playerEl.style.transition = 'left 0.3s, top 0.3s';
        } else {
            playerEl.style.transition = 'none';
        }
        playerEl.style.left = x + 'px';
        playerEl.style.top = y + 'px';
    }

    function updatePasswordDisplay() {
        var parts = [];
        if (collectedPasswords['server1']) {
            parts.push('<span class="hack-pw-collected">SRV-01: ' +
                collectedPasswords['server1'].map(function (d) { return ARROW_SYMBOLS[d]; }).join(' ') +
                '</span>');
        }
        if (collectedPasswords['server2']) {
            parts.push('<span class="hack-pw-collected">SRV-02: ' +
                collectedPasswords['server2'].map(function (d) { return ARROW_SYMBOLS[d]; }).join(' ') +
                '</span>');
        }
        passwordDisplay.innerHTML = parts.join('');
    }

    function updateNodeStyles() {
        NODES.forEach(function (n) {
            var el = nodeEls[n.id];
            el.classList.toggle('hack-node-visited', !!collectedPasswords[n.id]);
            el.classList.toggle('hack-node-current', n.id === currentNodeId);
        });
    }

    function showServerModal(node) {
        inputMode = true;
        var pw = node.password.map(function (d) { return ARROW_SYMBOLS[d]; }).join('  ');
        statusEl.innerHTML = '<span class="hack-flash">' + node.label + ' — Memorize: ' + pw + '</span>';

        setTimeout(function () {
            collectedPasswords[node.id] = node.password.slice();
            updatePasswordDisplay();
            statusEl.textContent = 'Password fragment collected! Go back.';
            inputMode = false;
        }, 2500);
    }

    function startTerminalInput() {
        if (!collectedPasswords['server1'] || !collectedPasswords['server2']) {
            statusEl.textContent = 'Collect passwords from both servers first!';
            return;
        }
        inputMode = true;
        expectedSequence = FULL_PASSWORD.slice();
        inputSequence = [];
        inputDisplay.innerHTML = '';
        statusEl.innerHTML = '<span class="hack-flash">ENTER FULL PASSWORD</span>';
        updateInputDisplay();
    }

    function updateInputDisplay() {
        var html = '';
        for (var i = 0; i < FULL_PASSWORD.length; i++) {
            if (i < inputSequence.length) {
                html += '<span class="hack-input-char filled">' + ARROW_SYMBOLS[inputSequence[i]] + '</span>';
            } else {
                html += '<span class="hack-input-char">_</span>';
            }
        }
        inputDisplay.innerHTML = html;
    }

    function handleInput(dir) {
        if (inputMode && expectedSequence) {
            // Terminal password input
            inputSequence.push(dir);
            updateInputDisplay();

            if (inputSequence.length === expectedSequence.length) {
                var correct = true;
                for (var i = 0; i < expectedSequence.length; i++) {
                    if (inputSequence[i] !== expectedSequence[i]) { correct = false; break; }
                }
                if (correct) {
                    winSequence();
                } else {
                    failSequence();
                }
            }
            return;
        }

        if (inputMode) return;

        // Navigation
        var neighbors = getNeighbors(currentNodeId);
        var target = null;
        for (var i = 0; i < neighbors.length; i++) {
            var d = getDirection(currentNodeId, neighbors[i]);
            if (d === dir) { target = neighbors[i]; break; }
        }
        if (!target) return;

        currentNodeId = target;
        updatePlayerPos(true);
        updateNodeStyles();

        var node = getNode(target);
        if (node.type === 'server' && !collectedPasswords[node.id]) {
            showServerModal(node);
        } else if (node.type === 'terminal') {
            startTerminalInput();
        } else {
            statusEl.textContent = 'Navigate to servers to collect the password';
        }
    }

    function failSequence() {
        inputMode = false;
        expectedSequence = null;
        inputSequence = [];
        statusEl.innerHTML = '<span class="hack-error">ACCESS DENIED — Restarting...</span>';
        inputDisplay.innerHTML = '';

        setTimeout(function () {
            collectedPasswords = {};
            currentNodeId = 'start';
            updatePlayerPos(false);
            updateNodeStyles();
            updatePasswordDisplay();
            statusEl.textContent = 'Navigate to servers to collect the password';
        }, 1500);
    }

    function winSequence() {
        inputMode = true;
        statusEl.innerHTML = '<span class="hack-success">ACCESS GRANTED — VIRUSES DELETED</span>';
        inputDisplay.innerHTML = '';

        // Explosions
        for (var i = 0; i < 8; i++) {
            (function (idx) {
                setTimeout(function () {
                    spawnExplosion(mapWrap, idx);
                }, idx * 200);
            })(i);
        }

        setTimeout(function () {
            onComplete();
        }, 2500);
    }

    function spawnExplosion(container, idx) {
        var exp = document.createElement('div');
        exp.className = 'hack-explosion';
        exp.textContent = ['💥', '🔥', '✨', '💣', '🎆', '⚡', '💥', '🔥'][idx % 8];
        exp.style.left = (15 + Math.random() * 70) + '%';
        exp.style.top = (10 + Math.random() * 60) + '%';
        exp.style.fontSize = (30 + Math.random() * 30) + 'px';
        container.appendChild(exp);
        setTimeout(function () { exp.remove(); }, 1000);
    }

    // Keyboard support
    function keyHandler(e) {
        var map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
        if (map[e.key]) {
            e.preventDefault();
            handleInput(map[e.key]);
        }
    }
    document.addEventListener('keydown', keyHandler);

    // Store cleanup ref on overlay so parent can remove if needed
    var origCleanup = overlay._hackCleanup;
    overlay._hackCleanup = function () {
        document.removeEventListener('keydown', keyHandler);
        if (origCleanup) origCleanup();
    };

    // Init
    updatePlayerPos(false);
    updateNodeStyles();
    updatePasswordDisplay();
}
