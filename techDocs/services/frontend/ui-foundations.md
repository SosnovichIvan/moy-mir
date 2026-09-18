# Основа UI-библиотеки · блок C

Статус: блок C принят к продолжению. В D реализован Selection (FE-15); остальные управляющие компоненты ещё не реализованы.
Источник — [Figma, основы 17:3](https://www.figma.com/design/qTLyRxJkaRvicTercpHUqr?node-id=17-3), тема 02 «Близко к природе», Light/Dark.

## Каталог и структура

- `apps/frontend/.storybook/` — независимый Storybook 10.6 (React/Vite), переключатели темы и viewport.
- `apps/frontend/catalog/` — обзор палитры, типографики, размеров, отступов, радиусов и иконок; интерактивные controls Icon.
- `apps/frontend/src/shared/ui/` — публичный вход `index.ts`, стили, SVG и Icon. Нет зависимостей от API или предметных модулей.
- `openApi/frontend/ui.schema.json` → `src/shared/ui/generated/contracts.ts`: Theme, ControlSize, IconName, UiConfiguration. Это UI-схема JSON Schema, не HTTP API.

Запуск: из `apps/frontend` выполнить `npm ci`, `npm run catalog`; открыть http://127.0.0.1:6006.
Статическая версия: `npm run catalog:build && npm run catalog:preview`.
Пути историй: `/?path=/story/foundations--overview`, `/?path=/story/foundations--light`, `/?path=/story/foundations--dark`, `/?path=/story/icon--playground`.

## Токены и адаптивность

Единственный runtime-источник — `tokens.css`. 15 семантических цветов связаны с Tailwind через `@theme inline`; не копировать hex в компоненты.
Тема задаётся `data-theme="light|dark"` на html или контейнере; приложение пока использует Light по умолчанию. Переключатель и сохранение предпочтения приложения появятся в оболочке.

Шрифты Manrope Variable (заголовки 700) и Inter Variable поставляются локально из закреплённых npm-пакетов Fontsource; запросов к Google Fonts нет. OFL-лицензии сохранены в `public/licenses/` и входят в обе сборки.

| Основа | Значения |
| --- | --- |
| Контролы S / M / L | 44 / 48 / 56 px |
| Иконки S / M / L | 20 / 24 / 28 px; исходная сетка 24 |
| Иконка мобильной навигации | 22 px |
| Отступы | 0, 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64 px; Tailwind spacing = 4 px |
| Радиусы | 8, 12, 16, 20, 28, 999 px |
| Mobile / tablet / desktop | <768 / 768–1023 / ≥1024 px |
| Поля контейнера | 16 / 24 / 32 px; максимальная ширина обзора 1200 px |
| Display / Heading / Title | 32/42, 24/34, 20/28 px |
| Body / Label / Caption | 16/24, 14/20, 12/18 px |

Размер выбирается контекстом, а не автоматически по ширине: S сохраняет область касания 44 px. Узкий экран меняет ширину, переносы и композицию. Значения 20/24/28 для общего Icon — техническое предложение блока C; навигация сохраняет согласованные 22 px и смену цвета без фоновой плашки.

Синхронизация: сначала изменение и согласование Figma → сверка variables коллекции 4:22 → правка `tokens.css` → просмотр Light/Dark на 320/390/768/1440 → PR с изменёнными токенами и скриншотами. Автоматического двустороннего sync нет. Не генерировать вторую независимую палитру в TypeScript.

## Иконки

SVG экспортированы из существующих компонентов Figma, геометрия не перерисована. Icon применяет SVG как CSS mask и наследует currentColor. Компонент декоративный (`aria-hidden`); доступное имя задаётся родительской кнопке/ссылке. Сам Icon не является действием.

| Имя | Figma ID |
| --- | --- |
| plus | 23:35 |
| arrow | 23:38 |
| close | 23:41 |
| eye | 23:45 |
| eyeOff | 23:49 |
| check | 23:52 |
| users | 23:56 |
| user | 23:60 |
| inbox | 23:63 |

## Контракты для реализации блока D

Ниже — проект публичного API блока C. Selection уже реализован: [фактический API](selection.md). Остальные строки остаются планом. Сериализуемые варианты/модели добавляются в JSON Schema и генерируются перед реализацией; ручные дубликаты запрещены. ReactNode, DOM-атрибуты, refs и callbacks — технические props, не DTO. События передают значения, а не подменяют серверные команды.

| Компонент / Figma ID | Контракт и состояние |
| --- | --- |
| Button / 17:97 | size, variant, disabled, loading, startIcon/endIcon; children и DOM onClick; loading блокирует повторное действие |
| IconButton / 23:957 | size, variant, icon, disabled/loading; обязательное aria-label |
| Field / 17:174 | value/onValueChange, label, hint/error, type, disabled/readOnly, size; onClear; видимость пароля локальна и не меняет value |
| Selection / 17:271 | checkbox/radio/switch; checked/onCheckedChange, label, disabled; строка от 48 px по согласованному макету, ширина по контейнеру; группа radio управляется родителем |
| Avatar / 17:323 | src, displayName, size; fallback при отсутствии/ошибке изображения |
| Badge / 17:351 | tone, size, label/count, startIcon/endIcon; одна цифра в круге, без интерактивности |
| InfoBanner / 17:437 | tone, size, title/message; optional action/onDismiss; role по важности, не всем alert |
| EntityCard / 17:532 | сгенерированная view model; onOpen/onAction отдельно, без вложенных кнопок |
| Message / 17:617 | сгенерированная view model, delivery state; onRetry; без транспорта внутри |
| EventCard / 17:664 | сгенерированная view model; onOpen/onJoin; состояние участия от родителя |
| PostCard / 17:704 | сгенерированная view model; callbacks действий; сетевые операции снаружи |
| WorkoutEntry / 17:749 | сгенерированная view model; onEdit; метрики из схемы, без собственной доменной логики |
| Navigation / 17:803 | items, activeId, onNavigate; ссылки для маршрутов; mobile панель 56 px, item 48 px, icon 22 px |
| Dialog / 17:850 | open/onOpenChange, title, description, children; focus trap, Escape и возврат фокуса |

Управляемые value/checked/open/activeId не копируются во внутреннее состояние. Схемы предметных карточек создаются вместе с их реализацией и согласованными данными; текущая UI-схема не придумывает backend DTO.

## Генерация и проверки

`npm run generate:ui` запускает json-schema-to-typescript и форматирование. Generated-файл коммитится; `generate:check` повторяет генерацию и отклоняет diff. Типы проверяются tsc и использованием в Icon/историях. Generated declarations явно исключены из lint/coverage; их нельзя менять вручную.

Unit-тесты проверяют декоративность всех 9 иконок и доступное имя родительского действия. Browser-тесты проверяют обе темы, размеры, цвет/mask, локальные шрифты, отсутствие горизонтального переполнения и клавиатурный фокус. Stories — демонстрационные композиции вне runtime src; покрываются browser-тестами. CSS и assets не измеряются line coverage.

CI собирает приложение и каталог, выполняет unit/coverage и обе группы Playwright; сохраняет статический каталог и отчёты. Предупреждение о крупных chunks Storybook относится к инструменту документации и не включается в production-приложение.
