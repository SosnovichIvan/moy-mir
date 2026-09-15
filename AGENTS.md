# Мой МИР — правила проекта

## Обязательные инструкции пользователя

1. Работа по этапам: аналитика → согласование → дизайн → согласование → DevOps → согласование → модели БД → согласование → backend → согласование → frontend → ревью и согласование → покрытие собственного кода не менее 90% → финальное ревью кода соответствующими скилами. Не переходить к следующему этапу без явного согласования. Источник — пользовательская постановка, журнал в `techDocs/process/stages.md`.
2. Mobile first, PWA, Tailwind и визуальное направление «Круг» из `reference/`. Старт: основной модульный backend core, отдельные backend identity (авторизация) и media (файлы); единый модульный frontend. Границы готовятся для последующего выделения микросервисов/MFE, но runtime MFE и mesh не обязательны в V1. Эта правка пользователя заменяет исходное требование раздельного развёртывания всех модулей. Конкретные стеки и инфраструктура требуют решения на своём этапе.
3. Все контракты в общей директории `openApi/`, разбиты по сервисам. Все модели frontend/backend — только генерация из схем, без ручного дублирования и правок generated-файлов. Правила категорий моделей: `openApi/README.md`.
4. Вся техническая документация в `techDocs/`, посервисно; обновлять её вместе с изменениями. Не называть план реализованной функциональностью.
5. До работы над сервисом прочитать `techDocs/services/<service>/context.md`; при появлении кода создать локальный AGENTS.md, ссылающийся на этот контекст. В конце задачи обновить статус, решения, проверки и следующий шаг.
6. Скилы устанавливать из `/Users/ivansosnovich/Documents/codex/skils` в проектный `agentSkills/`, регистрировать в этом файле. Каждая часть применяет профильные engineering/review-скилы; выбор указан в `techDocs/process/skills.md`. Не включать дополнительные правила установщика вместо пользовательского процесса. Не менять исходный каталог скилов.
7. Использовать только данные своего сервиса/модуля. Внутри core взаимодействовать через публичные интерфейсы, между сервисами — через API; не обращаться к чужим таблицам. Сетевую инфраструктуру выбрать на DevOps-этапе. Проверять предметные права на сервере, включая прямые ссылки и действующие соединения.
8. Продукт: до 5000 пользователей, Россия, без монетизации; группы любого размера и принципа, свободное общение. Отдельной роли тренера нет: друг назначается модератором тренировок. Отчёты только внутри приложения. Разовые и повторяющиеся тренировки, журнал и сжатие периода с датой операции и последними результатами. Семантика сжатия без удаления истории — предложение в продуктовом документе.
9. До начала прочитать `techDocs/README.md` и журнал согласования. На текущем этапе допустимы аналитика, документация и необходимые скилы; реализация ещё не разрешена.

## Обязательный порядок выполнения задач с кодом

Все задачи с кодом выполнять через [execution-state](agentSkills/execution-state/SKILL.md): разработка, исправления, рефакторинг, тесты, ревью, генераторы, миграции, сборочные скрипты и инфраструктурный код. До начала изменений прочитать скил и выполнить его маршрутизацию; затем использовать профильный engineering/review-скил. Предварительное чтение для оценки объёма разрешено.

Политика установки `all_tasks` обеспечивает активацию скила на каждой задаче. Для короткой связной задачи допускается предусмотренный скилом `passthrough`: это результат маршрутизации, а не обход скила. Для `lite`/`reset` вести состояние, semantic chunks, проверки и checkpoints по правилам скила; не редактировать state вручную. Не объявлять работу выполненной до проверок её выбранного workflow.

Правило обязательно для всех сервисов и модулей. Оно не заменяет согласования этапов и предметные скилы. Режим enforcement — `instructions`: правило задано агенту, технические блокирующие hooks не установлены.

<!-- agent-skills-lab:skills:start -->
## Installed agent skills

For every matching task, read and follow the parent skill's `SKILL.md` before
changing files. Installed references extend only their parent skill and must not
be invoked or applied independently. Explicit user instructions, permissions,
and verified repository configuration take precedence over generic profiles.

- `backend-engineering`: read [agentSkills/backend-engineering/SKILL.md](agentSkills/backend-engineering/SKILL.md) for matching tasks. Profile: Node.js / TypeScript.
- `backend-review`: read [agentSkills/backend-review/SKILL.md](agentSkills/backend-review/SKILL.md) for matching tasks. Profile: bundled.
- `database-engineering`: read [agentSkills/database-engineering/SKILL.md](agentSkills/database-engineering/SKILL.md) for matching tasks. Profile: PostgreSQL.
- `database-review`: read [agentSkills/database-review/SKILL.md](agentSkills/database-review/SKILL.md) for matching tasks. Profile: PostgreSQL.
- `execution-state`: read [agentSkills/execution-state/SKILL.md](agentSkills/execution-state/SKILL.md) for matching tasks. Profile: bundled.
- `frontend-engineering`: read [agentSkills/frontend-engineering/SKILL.md](agentSkills/frontend-engineering/SKILL.md) for matching tasks. Profile: TypeScript, React, Flexible logic-based.
- `frontend-review`: read [agentSkills/frontend-review/SKILL.md](agentSkills/frontend-review/SKILL.md) for matching tasks. Profile: bundled.
- `icon-system`: read [agentSkills/icon-system/SKILL.md](agentSkills/icon-system/SKILL.md) for matching tasks. Profile: bundled.
- `project-architecture`: read [agentSkills/project-architecture/SKILL.md](agentSkills/project-architecture/SKILL.md) for matching tasks. Profile: bundled.
- `ui-ux-design`: read [agentSkills/ui-ux-design/SKILL.md](agentSkills/ui-ux-design/SKILL.md) for matching tasks. Profile: bundled.
- `ux-writing`: read [agentSkills/ux-writing/SKILL.md](agentSkills/ux-writing/SKILL.md) for matching tasks. Profile: bundled.
<!-- agent-skills-lab:skills:end -->

<!-- agent-skills-lab:project-rules:start -->

## Approved project rules

Only the rule IDs below are active. Other bundled project-rules references are inactive.

Use these approved snapshots rather than newer project-rules references in skill packages.

No project rules approved. Ordinary skill instructions still apply.

<!-- agent-skills-lab:project-rules:end -->

<!-- agent-skills-lab:execution-policy:start -->
## Execution-state policy

Scope: `all_tasks`. Enforcement: `instructions`.

Before any task, route it through execution-state before implementation or mutation begins. Read-only inspection needed to estimate the workload is allowed.

Execution-state is a coordinator, not a replacement for implementation skills.
After routing, apply every other skill required by the task inside the selected
execution profile. A `passthrough` decision is valid and must not create state.
This policy never expands permissions or overrides explicit user instructions.

Read and apply [agentSkills/execution-state/SKILL.md](agentSkills/execution-state/SKILL.md) when this policy requires routing.
<!-- agent-skills-lab:execution-policy:end -->
