# Button и IconButton · FE-13

Статус: реализовано для ревью в блоке D. Состояния Figma согласованы сообщением «состояния реализованы в фигме и согласованы». Продуктовые сценарии и API не добавлены.

Источники: [Primary](https://www.figma.com/design/qTLyRxJkaRvicTercpHUqr?node-id=17-97), [Secondary](https://www.figma.com/design/qTLyRxJkaRvicTercpHUqr?node-id=35-200), [Danger](https://www.figma.com/design/qTLyRxJkaRvicTercpHUqr?node-id=36-248), [IconButton](https://www.figma.com/design/qTLyRxJkaRvicTercpHUqr?node-id=23-957). [Дополнение дизайна](../../design/component-library.md#подготовка-fe-13--button).

## API и использование

Импорт из публичного `src/shared/ui/index.ts`; общий `styles.css` подключается один раз.

```tsx
<Button
  label="Пригласить"
  leadingIcon="plus"
  trailingIcon="arrow"
  variant="primary"
  size="m"
  loading={pending}
  onClick={invite}
/>
<IconButton label="Добавить друга" icon="plus" onClick={openInvite} />
```

- Button: обязательный `label`; `variant` — primary/secondary/danger (primary по умолчанию), `size` — s/m/l (m), независимые `leadingIcon`/`trailingIcon`, `disabled`, `loading`, `loadingLabel` (по умолчанию «Подождите…»).
- IconButton: обязательные `label` (доступное имя действия) и `icon`; `size`, `disabled`, `loading`. Оформление Primary — по согласованному набору. При loading символ заменяется точным SVG из Figma; имя действия сохраняется, `aria-busy=true` сообщает занятость.
- Нативный `<button>`: Enter/Space, DOM-атрибуты формы, обработчики и ref. `type=button` по умолчанию предотвращает случайный submit; для отправки явно задать `type=submit`. `className` применяется к самому button.
- `disabled || loading` задаёт нативный disabled: нет клика/submit, кнопка пропускается при Tab. Значение loading принадлежит вызывающему коду: установить при начале операции, снять при завершении/ошибке. Компонент не выполняет запросы и не управляет Promise. Это блокировка UI, не серверная идемпотентность.
- Подписи — текст, декоративные иконки скрыты от accessibility tree. `children`, HTML-вставки, `aria-busy` и `aria-disabled` не являются изменяемыми props; у IconButton доступное имя задаётся через label.

Контракты `openApi/frontend/button.schema.json` и `iconButton.schema.json` → generated/button.ts и generated/iconButton.ts. Размеры и имена иконок ссылаются на определения ui.schema.json, ручных дублей нет. React refs, DOM-атрибуты и callbacks — технические bindings.

## Визуальное поведение

S/M/L: минимум 44/48/56 px, padding 8/12/16 px, radius 16 px и gap 8 px. Длинная подпись переносится с увеличением высоты; ширину задаёт контейнер. Иконки текстовой кнопки 20 px. IconButton остаётся квадратным 44/48/56 с radius 12; символы S/M — 20 px, L — 24 px, индикатор загрузки — 20 px.

Все цвета используют существующие Light/Dark-токены. Hover только при поддержке указателя; Pressed и Focus — реальные псевдосостояния, не props для имитации. Внутренний контур 2 px сохраняется при hover. При сочетании клавиатурного фокуса и нажатия контур использует onPressed, чтобы не исчезнуть на фоне ink. Loading сохраняет цвет своего варианта, Disabled использует line/muted.

В forced colors сохраняются системные границы кнопок, контур и окрашенные CSS-mask иконки. Анимация не добавлена. `assets/loading.svg` — неизменённый экспорт Figma 23:1690 (в составе IconButton 23:957), используется как mask с currentColor; сторонняя библиотека иконок не добавлялась.

## Каталог и проверки

`npm run catalog` → `/?path=/story/button--overview`; отдельные `button--light` и `button--dark`. Показаны три варианта, размеры, иконки слева/справа/с обеих сторон, disabled/loading, длинные подписи, IconButton и интерактивный пример начала/завершения операции.

Локальные проверки:

- `npm run check`: генерация без diff, lint, typecheck, форматирование и 52 unit-теста; 100% statements/branches/functions/lines собственного runtime-кода на файл. Порог и исключения покрытия сохранены.
- `npm run build` и `npm run catalog:build` прошли; `npm run test:e2e` — 2 smoke-теста production-приложения.
- `npm run test:catalog` — 35 тестов (13 новых для кнопок). Проверки каталога: размеры, центрирование, обе темы на 320/390/768/1440 px, hover/pressed/focus, клавиатура, повторная активация, текст 200%, touch и forced colors.
- Визуально просмотрены Light 320 px и Dark 1440 px: переносы, геометрия, цвета и SVG сопоставлены с Figma. Это визуальное ревью, не попиксельный snapshot-тест.

Ревью frontend-review и ui-ux-design: нативная семантика, controlled loading, доступные имена, реэкспорт, generated-контракты, токены и комбинации состояний. Подтверждённых дефектов в текущем объёме не осталось. Firefox/WebKit, физические устройства и скринридеры не проверены.

Следующий шаг — ревью FE-13; затем FE-14 Field после подготовки и согласования недостающих сочетаний состояний. Остальной D и блок E не завершены.
