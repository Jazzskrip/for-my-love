/* === Монетка === */

function startCoinGame(container, { onResult }) {
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'coin-game';

    // Заголовок
    const title = document.createElement('div');
    title.className = 'coin-game-title';
    title.textContent = 'Выбери сторону!';
    wrapper.appendChild(title);

    // Монета
    const coinWrap = document.createElement('div');
    coinWrap.className = 'coin-wrap';

    const coin = document.createElement('div');
    coin.className = 'coin';

    const front = document.createElement('div');
    front.className = 'coin-face coin-front';
    front.innerHTML = '<span>&#10084;</span>';

    const back = document.createElement('div');
    back.className = 'coin-face coin-back';
    back.innerHTML = '<span>&#128139;</span>';

    coin.appendChild(front);
    coin.appendChild(back);
    coinWrap.appendChild(coin);
    wrapper.appendChild(coinWrap);

    // Кнопки выбора
    const buttons = document.createElement('div');
    buttons.className = 'coin-buttons';

    const btnFront = document.createElement('button');
    btnFront.className = 'coin-btn';
    btnFront.innerHTML = '&#10084; Сердечко';
    btnFront.type = 'button';

    const btnBack = document.createElement('button');
    btnBack.className = 'coin-btn';
    btnBack.innerHTML = '&#128139; Поцелуй';
    btnBack.type = 'button';

    buttons.appendChild(btnFront);
    buttons.appendChild(btnBack);
    wrapper.appendChild(buttons);

    // Результат (скрыт)
    const result = document.createElement('div');
    result.className = 'coin-result';
    wrapper.appendChild(result);

    container.appendChild(wrapper);

    function handleChoice(chosenSide) {
        btnFront.disabled = true;
        btnBack.disabled = true;
        buttons.classList.add('coin-buttons-disabled');
        title.textContent = 'Подбрасываю...';

        // Анимация: монета крутится, потом останавливается на выбранной стороне
        const extraSpins = 5;
        const targetDeg = chosenSide === 'back' ? (extraSpins * 360 + 180) : (extraSpins * 360);
        coin.style.transform = 'rotateY(' + targetDeg + 'deg)';
        coin.classList.add('coin-spinning');

        setTimeout(function() {
            coin.classList.remove('coin-spinning');
            title.textContent = 'Ты угадал!';
            result.innerHTML = chosenSide === 'front' ? '&#10084; Сердечко!' : '&#128139; Поцелуй!';
            result.classList.add('coin-result-visible');

            // Пауза, показываем победу
            setTimeout(function() {
                title.textContent = '🎉 Победа!';
                title.classList.add('coin-game-title-win');
                buttons.style.display = 'none';
                result.innerHTML = 'Ты выиграл!';

                // Даём прочитать, потом вызываем onResult
                setTimeout(function() {
                    if (onResult) onResult('win');
                }, 2000);
            }, 1500);
        }, 2000);
    }

    btnFront.addEventListener('click', function() { handleChoice('front'); });
    btnBack.addEventListener('click', function() { handleChoice('back'); });
}
