/* === Рулетка === */

function startRouletteGame(container, { onResult }) {
    container.innerHTML = '';

    var wrapper = document.createElement('div');
    wrapper.className = 'roulette-game';

    var canvas = document.createElement('canvas');
    canvas.className = 'roulette-canvas';
    wrapper.appendChild(canvas);

    // Стрелка
    var arrow = document.createElement('div');
    arrow.className = 'roulette-arrow';
    arrow.innerHTML = '&#9660;';
    wrapper.appendChild(arrow);

    var msgEl = document.createElement('div');
    msgEl.className = 'roulette-msg';
    wrapper.appendChild(msgEl);

    // Кнопки ставки
    var btnWrap = document.createElement('div');
    btnWrap.className = 'roulette-btn-wrap';

    var btnRed = document.createElement('button');
    btnRed.className = 'roulette-bet-btn roulette-bet-red';
    btnRed.type = 'button';
    btnRed.textContent = 'Красное';
    btnWrap.appendChild(btnRed);

    var btnBlack = document.createElement('button');
    btnBlack.className = 'roulette-bet-btn roulette-bet-black';
    btnBlack.type = 'button';
    btnBlack.textContent = 'Чёрное';
    btnWrap.appendChild(btnBlack);

    wrapper.appendChild(btnWrap);

    container.appendChild(wrapper);

    // Размеры — побольше
    var SIZE = Math.min(container.clientWidth - 24, 420);
    var dpr = window.devicePixelRatio || 1;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    canvas.style.width = SIZE + 'px';
    canvas.style.height = SIZE + 'px';
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    var CENTER = SIZE / 2;
    var RADIUS = SIZE / 2 - 6;

    // Секторы: красный/чёрный чередуются (8 секторов)
    var sectors = [];
    for (var i = 0; i < 8; i++) {
        sectors.push({
            color: i % 2 === 0 ? 'red' : 'black',
            fill: i % 2 === 0 ? '#d32f2f' : '#212121'
        });
    }

    var SECTOR_ANGLE = (Math.PI * 2) / sectors.length;

    var currentAngle = 0;
    var spinning = false;
    var spinCount = 0;
    var chosenColor = null;

    function drawWheel(angle) {
        ctx.clearRect(0, 0, SIZE, SIZE);

        ctx.save();
        ctx.translate(CENTER, CENTER);
        ctx.rotate(angle);

        for (var i = 0; i < sectors.length; i++) {
            var startA = i * SECTOR_ANGLE;
            var endA = startA + SECTOR_ANGLE;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, RADIUS, startA, endA);
            ctx.closePath();
            ctx.fillStyle = sectors[i].fill;
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Числа в секторах
            ctx.save();
            ctx.rotate(startA + SECTOR_ANGLE / 2);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 22px Nunito, sans-serif';
            ctx.fillStyle = '#fff';
            ctx.fillText(String(i + 1), RADIUS * 0.6, 0);
            ctx.restore();
        }

        ctx.restore();

        // Золотая обводка
        ctx.beginPath();
        ctx.arc(CENTER, CENTER, RADIUS + 3, 0, Math.PI * 2);
        ctx.strokeStyle = '#c8a84e';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Центр
        ctx.beginPath();
        ctx.arc(CENTER, CENTER, 22, 0, Math.PI * 2);
        ctx.fillStyle = '#c8a84e';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(CENTER, CENTER, 16, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
    }

    function getTargetSectorIndex(color) {
        var matching = [];
        for (var i = 0; i < sectors.length; i++) {
            if (sectors[i].color === color) matching.push(i);
        }
        return matching[Math.floor(Math.random() * matching.length)];
    }

    function getTargetAngle(sectorIndex) {
        var sectorMiddle = sectorIndex * SECTOR_ANGLE + SECTOR_ANGLE / 2;
        var base = Math.PI / 2 + sectorMiddle;
        var fullSpins = (4 + Math.floor(Math.random() * 3)) * Math.PI * 2;
        return fullSpins + base;
    }

    function spin(betColor) {
        if (spinning) return;
        spinning = true;
        spinCount++;
        chosenColor = betColor;
        btnRed.disabled = true;
        btnBlack.disabled = true;
        msgEl.textContent = '';
        msgEl.className = 'roulette-msg';

        // Первый спин — проигрыш (падает на другой цвет)
        // Второй+ — выигрыш (падает на выбранный цвет)
        var landColor;
        if (spinCount === 1) {
            landColor = betColor === 'red' ? 'black' : 'red';
        } else {
            landColor = betColor;
        }

        var targetIndex = getTargetSectorIndex(landColor);
        var targetAngle = getTargetAngle(targetIndex);

        var startAngle = currentAngle;
        var totalRotation = targetAngle;
        var startTime = null;
        var duration = 3500 + Math.random() * 1000;

        function easeOut(t) {
            return 1 - Math.pow(1 - t, 3.5);
        }

        function tick(timestamp) {
            if (!startTime) startTime = timestamp;
            var elapsed = timestamp - startTime;
            var progress = Math.min(elapsed / duration, 1);
            var eased = easeOut(progress);

            currentAngle = startAngle + totalRotation * eased;
            drawWheel(-currentAngle);

            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                spinning = false;
                showResult(landColor);
            }
        }

        requestAnimationFrame(tick);
    }

    function showResult(landColor) {
        var won = landColor === chosenColor;
        if (won) {
            var colorName = landColor === 'red' ? 'Красное' : 'Чёрное';
            msgEl.textContent = '🎉 ' + colorName + '! Победа!';
            msgEl.className = 'roulette-msg roulette-msg-visible roulette-msg-win';
            btnWrap.style.display = 'none';
            setTimeout(function() {
                if (onResult) onResult('win');
            }, 2000);
        } else {
            var landName = landColor === 'red' ? 'Красное' : 'Чёрное';
            msgEl.textContent = 'Выпало ' + landName + '! Не повезло';
            msgEl.className = 'roulette-msg roulette-msg-visible';
            btnRed.disabled = false;
            btnBlack.disabled = false;
        }
    }

    btnRed.addEventListener('click', function() { spin('red'); });
    btnBlack.addEventListener('click', function() { spin('black'); });

    drawWheel(-currentAngle);
}
