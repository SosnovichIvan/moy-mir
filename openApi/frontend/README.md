# Контракты frontend

`ui.schema.json` — JSON Schema сериализуемой конфигурации UI: Theme, ControlSize, IconName и UiConfiguration. Это не HTTP API.

Генерация из `apps/frontend`: `npm run generate:ui`. Результат — `src/shared/ui/generated/contracts.ts`; ручные изменения запрещены. CI запускает `generate:check` и проверяет отсутствие diff. Runtime-компоненты импортируют типы из generated.

ReactNode, DOM-атрибуты, refs и callbacks — технические props; их не помещают в сериализуемые схемы. Предметные view models будут добавлены до реализации карточек, API DTO — из контрактов соответствующих сервисов.

[Контекст](../../techDocs/services/frontend/context.md) · [Правила моделей](../README.md) · [UI-контракты](../../techDocs/services/frontend/ui-foundations.md)

`selection.schema.json`, `button.schema.json`, `iconButton.schema.json`, `field.schema.json` описывают конфигурацию соответствующих компонентов; генерируются в одноимённые файлы `src/shared/ui/generated/`. Общие размеры и имена иконок в схемах кнопок используют `$ref` на `ui.schema.json`. Все пять схем проверяет `generate:check`.
