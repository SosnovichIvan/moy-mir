# Контракты frontend

FE-20 добавляет четыре сериализуемые UI-схемы: `message.schema.json`, `eventCard.schema.json`, `postCard.schema.json` и `workoutEntry.schema.json`. Они описывают только подтверждённые данные и controlled-состояния представления. Callbacks, DOM bindings и выбор responsive-компоновки остаются техническими props. Генерация включает 17 схем.

FE-19 добавляет `entityCard.schema.json`: сериализуемая UI-конфигурация шести состояний, допустимое действие загрузки и обязательный адрес для Friend/Member. Это не серверная модель дружбы или группы. Генерируется `src/shared/ui/generated/entityCard.ts`; callbacks и нативные свойства ссылки остаются техническими props. Вместе с двумя схемами Navigation генерация теперь включает 13 схем.

FE-17 добавляет `infoBanner.schema.json` и `dialog.schema.json`: конфигурации генерируются в одноимённые файлы `src/shared/ui/generated/`. Всего `generate:check` проверяет десять схем. React callbacks, слоты и DOM refs остаются техническими props.

`ui.schema.json` — JSON Schema сериализуемой конфигурации UI: Theme, ControlSize, IconName и UiConfiguration. Это не HTTP API.

Генерация из `apps/frontend`: `npm run generate:ui`. Результат — `src/shared/ui/generated/contracts.ts`; ручные изменения запрещены. CI запускает `generate:check` и проверяет отсутствие diff. Runtime-компоненты импортируют типы из generated.

ReactNode, DOM-атрибуты, refs и callbacks — технические props; их не помещают в сериализуемые схемы. Предметные view models будут добавлены до реализации карточек, API DTO — из контрактов соответствующих сервисов.

[Контекст](../../techDocs/services/frontend/context.md) · [Правила моделей](../README.md) · [UI-контракты](../../techDocs/services/frontend/ui-foundations.md)

`selection.schema.json`, `button.schema.json`, `iconButton.schema.json`, `field.schema.json`, `avatar.schema.json`, `badge.schema.json`, `countBadge.schema.json` описывают конфигурацию соответствующих компонентов; генерируются в одноимённые файлы `src/shared/ui/generated/`. Общие размеры и имена иконок используют `$ref` на `ui.schema.json`. Все восемь схем проверяет `generate:check`.
