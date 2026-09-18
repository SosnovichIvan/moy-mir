# Selection · FE-15

Статус: реализовано для ревью. Новые Light/Dark состояния согласованы 2026-09-18 сообщением «темы согласлованы». Это часть блока D, без продуктовых сценариев и API.

Источник: [Selection 17:271](https://www.figma.com/design/qTLyRxJkaRvicTercpHUqr?node-id=17-271), [Light 31:31](https://www.figma.com/design/qTLyRxJkaRvicTercpHUqr?node-id=31-31), [Dark 31:222](https://www.figma.com/design/qTLyRxJkaRvicTercpHUqr?node-id=31-222).

## Использование

Импортировать `Checkbox`, `Radio`, `Switch` через `src/shared/ui/index.ts`. Общий `styles.css` подключается один раз в точке входа, как уже сделано в приложении и каталоге.

```tsx
const [checked, setChecked] = useState(false);

<Checkbox
  label="Запомнить меня"
  checked={checked}
  onCheckedChange={setChecked}
/>;
```

- `label`, `checked`, `onCheckedChange` обязательны. `disabled` по умолчанию false.
- Значение принадлежит родителю. Компоненты не копируют props в локальное состояние; callback сообщает новое boolean-значение. Для сброса формы родитель сбрасывает `checked`.
- Radio: общий `name`, разные `value`, один источник выбранного значения. Группу помещать в `fieldset` с `legend`. Повторное нажатие выбранного radio не снимает выбор и не вызывает callback.
- Нативные DOM-атрибуты (`id`, `name`, `value`, `required`, `aria-describedby`), события фокуса и `ref` передаются input. `className` применяется к строке label. `type`, `role`, `aria-checked`, `defaultChecked` и `onChange` управляются компонентом.
- Видимая подпись — обычный текст. Ссылки и другие вложенные действия не помещаются в label.
- Сериализуемый контракт: `openApi/frontend/selection.schema.json` → `src/shared/ui/generated/selection.ts`. `npm run generate:ui` генерирует обе UI-схемы; `generate:check` проверяет отсутствие diff. Callback, ref и DOM bindings — технические React props, ручных DTO нет.

## Отображение и взаимодействие

Строка занимает ширину контейнера, высота от 48 px; длинный текст переносится и увеличивает высоту. Размеры S/M/L для Selection не вводились: согласованный макет задаёт одну область нажатия от 48 px. Индикаторы Checkbox/Radio 24×24, Switch 44×24; галочка 18×18 из существующего SVG, точка Radio 10×10, ползунок Switch 20×20 с краевыми отступами 2 px.

Off/On независимы от hover/pressed/focus/disabled. Hover использует soft только при поддержке наведения, pressed — line. Клавиатурный контур focus имеет толщину 2 px и отступ 4 px, сохраняется при наведении. Disabled сохраняет checked, блокирует изменения и пропускается при Tab; выбранный индикатор muted, невыбранный line. Light/Dark используют общие семантические токены.

Поведение обеспечивает нативный input: Space переключает checkbox/switch, стрелки выбирают radio внутри группы. Switch имеет роль switch и нативное checked. В системном режиме высокой контрастности показывается нативный индикатор вместо декоративного; область label остаётся кликабельной. Анимации не добавлены.

## Каталог и проверки

После `npm run catalog` открыть `/?path=/story/selection--overview`; есть отдельные Light/Dark истории. Каталог показывает выбранные, невыбранные, отключённые состояния, длинные подписи и радиогруппу. Hover/pressed/focus проверяются настоящими действиями; фиктивных props для имитации псевдосостояний нет.

Проверено локально:

- `npm run check`: генерация без diff, lint, TypeScript, Prettier, 43 unit-теста; 100% statements/branches/functions/lines собственного runtime-кода на файл. Порог и исключения не расширены.
- `npm run build`, `npm run catalog:build`: успешные сборки.
- `npm run test:e2e`: 2 smoke-теста production-приложения.
- `npm run test:catalog`: 22 теста, включая 13 новых для Selection. Light/Dark на 320/390/768/1440 px, центрирование, отсутствие overflow, focus, hover/pressed, переключение значений, disabled, radio со стрелками, touch без зависшего hover, увеличение текста до 200% и forced colors.
- Визуально просмотрены Light 320 px и Dark 1440 px и сопоставлены с Figma. Исправлен перенос заголовка каталога при увеличении текста. Это не автоматическое попиксельное сравнение.

Ревью `frontend-review` и `ui-ux-design`: проверены controlled state, нативная семантика, публичный экспорт, использование generated-модели и токенов, доступное имя и видимый фокус. Подтверждённых дефектов в текущем объёме не осталось. Firefox/WebKit, физические телефоны и скринридеры ещё не проверены.

CI запускается также для PR в `codex/**`, чтобы зависимые PR проходили те же проверки до слияния основы. Правила защищённых веток и требования ревью не изменены. Следующий шаг — ревью FE-15 и оставшиеся задачи D; FE-13/14/16–20 и блок E не завершены.
