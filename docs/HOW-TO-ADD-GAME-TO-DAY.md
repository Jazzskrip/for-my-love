# Как добавить игру к дню календаря

## 1. Создай файл игры

Файл: `js/games/<gameId>.js`

```js
function startXxxGame(container, { onResult }) {
    // container — пустой div, рендери сюда
    // onResult('win') — когда игрок выиграл
    // onResult('lose') — когда проиграл
}
```

## 2. Подключи скрипт в index.html

```html
<script src="js/games/xxx.js"></script>
```

Перед `<script src="js/calendar.js"></script>`.

## 3. Добавь в маппинг игр в calendar.js

Найди объект `games` внутри функции `showGameModal`:

```js
const games = {
    coin: typeof startCoinGame !== 'undefined' ? startCoinGame : null,
    flappy: typeof startFlappyGame !== 'undefined' ? startFlappyGame : null,
    // добавь сюда:
    xxx: typeof startXxxGame !== 'undefined' ? startXxxGame : null
};
```

## 4. Укажи игру в rewards.json

Добавь поле `"game": "<gameId>"` к нужному дню:

```json
{ "slot": 7, "icon": "🎮", "title": "День 7", "desc": "Описание", "game": "flappy" }
```

## 5. (Опционально) Добавь в дебаг-меню

В `index.html` в секцию "Игры":

```html
<option value="__game_xxx">Название игры</option>
```

Обработчик уже универсальный — все `__game_*` подхватываются автоматически.

## Поток открытия дня

```
Клик на день
  → tryAgain (если есть, несколько попыток)
  → game (если есть, модалка с игрой)
  → переворот карточки + сохранение прогресса
  → video (если есть, модалка с видео)
  → coupon (если есть, модалка с купоном)
```

Игра блокирует открытие дня — пока не выиграешь, карточка не перевернётся.

## Готовые игры

| ID | Файл | Функция | Описание |
|---|---|---|---|
| `coin` | `js/games/coin.js` | `startCoinGame` | Выбери сторону монетки (сердечко/поцелуй). Всегда win |
| `flappy` | `js/games/flappy.js` | `startFlappyGame` | Пролети через 5 труб, приземлись на бургер. Canvas |
| `roulette` | `js/games/roulette.js` | `startRouletteGame` | Ставка на красное/чёрное. Первый спин — проигрыш, второй — win |

## Пример: день с игрой + купоном

```json
{ "slot": 20, "icon": "🎯", "title": "День 20", "desc": "Описание", "game": "coin", "coupon": true }
```

Игрок выиграет в монетку → карточка откроется → покажется купон.
