# Структура данных (rewards.json)

## Поток открытия ячейки

```
Клик на ячейку
    |
    v
[tryAgain?] --да--> Показать фразу, счётчик++, СТОП
    |                (пока attempts не достигнут)
    нет / достигнут
    |
    v
[game?] --да--> Показать модалку с игрой
    |            Проиграл → попробовать снова
    |            Выиграл → продолжить ↓
    нет
    |
    v
Ячейка открывается (animation)
    |
    v
[video?] --да--> Модалка с видео, кнопка через buttonDelay сек
    |
    нет
    |
    v
Показать награду (title, desc, icon)
[coupon?] --да--> Пометить как купон
```

## Формат одного дня

```json
{
  "slot": 5,
  "icon": "🎮",
  "title": "Название подарка",
  "desc": "Описание подарка",
  "animation": "glitch",
  "tryAgain": { "attempts": 3 },
  "game": "flappy",
  "video": { "url": "https://www.youtube.com/embed/VIDEO_ID", "buttonDelay": 10 },
  "coupon": true
}
```

Все поля кроме `slot`, `icon`, `title`, `desc` — опциональны.

## Поля

| Поле | Тип | Обязательное | Описание |
|---|---|---|---|
| `slot` | number | да | Номер дня (1-30) |
| `icon` | string | да | Эмодзи иконка |
| `title` | string | да | Заголовок награды |
| `desc` | string | да | Описание награды |
| `animation` | string | нет | ID анимации открытия. По умолчанию `"flip"` |
| `tryAgain` | object | нет | Блокировка ячейки на N попыток |
| `tryAgain.attempts` | number | — | Сколько раз нужно нажать до открытия |
| `game` | string | нет | ID мини-игры (`"coin"`, `"guess"`, `"roulette"`, `"flappy"`, `"invaders"`) |
| `video` | object | нет | YouTube видео |
| `video.url` | string | — | Embed-ссылка на YouTube |
| `video.buttonDelay` | number | — | Через сколько секунд показать кнопку (сек) |
| `coupon` | boolean | нет | Пометить день как купон |

## Примеры конфигурации

### Обычный день (только текст)
```json
{ "slot": 1, "icon": "☀️", "title": "Доброе утро", "desc": "Первый подарок!" }
```

### День с видео
```json
{
  "slot": 2, "icon": "🎬", "title": "Смотри это", "desc": "Специально для тебя",
  "video": { "url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "buttonDelay": 15 }
}
```

### День с мини-игрой
```json
{
  "slot": 7, "icon": "🎮", "title": "Выиграй подарок", "desc": "Пройди игру!",
  "game": "flappy"
}
```

### День с обманкой + видео
```json
{
  "slot": 10, "icon": "🔮", "title": "Сюрприз", "desc": "Не сразу откроется",
  "tryAgain": { "attempts": 3 },
  "video": { "url": "https://www.youtube.com/embed/xxx", "buttonDelay": 10 }
}
```

### День с игрой + купон
```json
{
  "slot": 15, "icon": "🎰", "title": "Джекпот", "desc": "Крутой купон!",
  "game": "roulette",
  "coupon": true
}
```

### Полный набор (tryAgain + game + video + coupon)
```json
{
  "slot": 20, "icon": "🏆", "title": "Главный приз", "desc": "Пройди всё!",
  "animation": "shatter",
  "tryAgain": { "attempts": 2 },
  "game": "coin",
  "video": { "url": "https://www.youtube.com/embed/xxx", "buttonDelay": 20 },
  "coupon": true
}
```
