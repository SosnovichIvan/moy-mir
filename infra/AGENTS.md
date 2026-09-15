# Подготовка DevOps

Прочитать [правила проекта](../AGENTS.md) и [этапы](../techDocs/process/stages.md). Каталог подготовлен; конфигурации инфраструктуры и дизайн ещё не созданы.

- [project-architecture](../agentSkills/project-architecture/SKILL.md).
- [backend-review](../agentSkills/backend-review/SKILL.md).

Отдельного DevOps-скила в источнике нет; инфраструктурные решения проверять по официальной документации выбранных инструментов.

## Выполнение через состояние

Все задачи с кодом, тестами, ревью, генерацией, миграциями и инфраструктурными скриптами сначала маршрутизировать через [execution-state](../agentSkills/execution-state/SKILL.md), затем применять профильные скилы. Для коротких задач допустим `passthrough` по правилам скила; для длительных вести state и checkpoints. Корневой execution policy обязателен.
