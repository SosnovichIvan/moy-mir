# Дизайн

Прочитать [правила проекта](../../AGENTS.md) и [этапы](../process/stages.md). Каталог подготовлен; конфигурации инфраструктуры и дизайн ещё не созданы.

- [ui-ux-design](../../agentSkills/ui-ux-design/SKILL.md).
- [ux-writing](../../agentSkills/ux-writing/SKILL.md).
- [icon-system](../../agentSkills/icon-system/SKILL.md).

Использовать референс «Круг» и актуальные продуктовые требования.

## Выполнение через состояние

Все задачи с кодом, тестами, ревью, генерацией, миграциями и инфраструктурными скриптами сначала маршрутизировать через [execution-state](../../agentSkills/execution-state/SKILL.md), затем применять профильные скилы. Для коротких задач допустим `passthrough` по правилам скила; для длительных вести state и checkpoints. Корневой execution policy обязателен.
