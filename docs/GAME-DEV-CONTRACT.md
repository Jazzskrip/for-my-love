# Контракт для разработки мини-игр

## Контекст

Адвент-календарь — статический сайт (HTML/CSS/JS, без сборки, деплой на Vercel). На некоторых днях перед получением награды нужно пройти мини-игру. Игра показывается в модалке.

## Твоя задача

Создать файл `js/games/<gameId>.js` с одной экспортируемой функцией. Каждая игра — отдельный файл.

## Сигнатура функции

```js
function startXxxGame(container, { onResult }) {
    // container — пустой <div>, в который ты рендеришь всю игру
    // onResult('win')  — вызови когда игрок выиграл
    // onResult('lose') — вызови когда игрок проиграл
}
```

Имя функции = `start` + CamelCase ID + `Game`. Например:
- `coin` → `startCoinGame`
- `flappy` → `startFlappyGame`
- `guess` → `startGuessGame`
- `roulette` → `startRouletteGame`
- `invaders` → `startInvadersGame`

Функция должна быть глобальной (без модулей, просто `function` в файле).

## Как это подключается

1. В `index.html` добавится `<script src="js/games/coin.js"></script>`
2. В `calendar.js` уже есть маппинг:
```js
const games = { coin: startCoinGame };
```
3. При клике на день с `"game": "coin"` в rewards.json → открывается модалка → вызывается `startCoinGame(container, { onResult })`

## Контейнер

- `container` — это `<div id="gameContent">` внутри модалки
- При вызове он **пустой** (`innerHTML = ''`)
- Размер: почти весь экран на мобильных, ~500×600px на десктопе
- Ты сам создаёшь всё внутри: canvas, кнопки, текст
- Когда модалка закрывается, `container.innerHTML` очищается снаружи — не нужно за собой убирать

## Правила

1. **Один файл = одна игра.** Файл: `js/games/<gameId>.js`
2. **Стили инлайном или через отдельный CSS.** Если нужен CSS → `css/games/<gameId>.css`
3. **Никаких зависимостей.** Только vanilla JS + Canvas API
4. **Мобильный first.** Touch-события обязательны. Целевое устройство — iPhone
5. **После проигрыша** — показать кнопку «Попробовать снова» и перезапустить игру внутри того же контейнера. Не вызывай `onResult('lose')` пока игрок не решит сдаться (если есть такая опция)
6. **После победы** — вызвать `onResult('win')`. Можно с небольшой задержкой для анимации победы
7. **Не закрывай модалку сам** — просто вызови `onResult`, остальное сделает calendar.js
8. **Размеры адаптивны** — используй `container.clientWidth` / `container.clientHeight` для canvas

## Список игр

| ID | Игра | Описание | Условие победы |
|---|---|---|---|
| `coin` | Монетка | Выбери орёл или решку, монетка крутится | Угадал сторону |
| `guess` | Угадай число | Число 1–100, 5 попыток, подсказки выше/ниже | Угадал число |
| `roulette` | Рулетка | Колесо с секторами, один выигрышный | Попал в нужный сектор |
| `flappy` | Flappy Bird | Canvas, тап = прыжок, пролети через трубы | Пролетел 5 труб |
| `invaders` | Space Invaders | Canvas, стреляй по рядам пришельцев | Убил всех |

## Пример: минимальная игра (coin)

```js
function startCoinGame(container, { onResult }) {
    const btn = document.createElement('button');
    btn.textContent = 'Подбросить монетку';
    btn.style.cssText = 'font-size:1.2rem; padding:12px 24px; cursor:pointer;';
    container.appendChild(btn);

    btn.addEventListener('click', function () {
        const win = Math.random() > 0.5;
        if (win) {
            btn.textContent = 'Ты выиграл!';
            setTimeout(function () { onResult('win'); }, 1000);
        } else {
            btn.textContent = 'Не повезло! Попробуй ещё';
            setTimeout(function () { btn.textContent = 'Подбросить монетку'; }, 1000);
        }
    });
}
```

## Тестирование

Открой `index.html` через локальный сервер, в debug-меню выбери «День 5» (или любой день где есть game), кликни на карточку — откроется модалка с твоей игрой.

Либо добавь в debug-меню строку для прямого запуска:
```html
<option value="__game_coin">Игра: Монетка</option>
```
