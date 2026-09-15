# Скилы и контексты агентов

Источник установки: `/Users/ivansosnovich/Documents/codex/skils` (именно такое написание каталога). Исходный репозиторий не изменять.

По запросу пользователя 2026-09-15 установлены все 11 скилов ниже в общий `agentSkills/`, зарегистрированы в корневом `AGENTS.md`. Локальные `AGENTS.md` сервисов и модулей направляют к этой установке и своим контекстам. Дублировать скилы по сервисам не требуется.

Профили подготовлены по кандидатному стеку: frontend — TypeScript, React, structure-flexible; backend — node-typescript; database-engineering и database-review — PostgreSQL. Это подготовка инструкций, не принятие стека. Перед реализацией сверить с ADR и переустановить нужные профили при изменении выбора. Скилы установлены, но ещё не применялись к реализации приложения.

Автоматические дополнительные project-rules установщика выключены; пользовательские правила AGENTS.md продолжают действовать. Для execution-state включена обязательная адаптивная маршрутизация `all_tasks` с enforcement `instructions`; технические hooks не установлены. Манифест установки: `agentSkills/.agent-skills-lab.json`, содержит версии, профили и контрольные суммы.

| Область | Скилы из источника |
| --- | --- |
| Выполнение задач | execution-state: обязательный вход для всех задач с кодом; all_tasks, adaptive, instructions |
| Архитектура | project-architecture |
| Дизайн | ui-ux-design, ux-writing, icon-system |
| Backend каждого сервиса/модуля | backend-engineering с профилем выбранного языка, backend-review |
| БД каждого сервиса/модуля | database-engineering, database-review с выбранной БД |
| Общий frontend и его внутренние модули | frontend-engineering с языком/framework/структурой, frontend-review |
| DevOps | Отдельного DevOps-скила в просмотренном каталоге нет; использовать project-architecture для границ и официальную документацию инструментов. Не заявлять применение отсутствующего скила |

Пример подготовки (не означает согласование стека): `python3 /Users/ivansosnovich/Documents/codex/skils/install.py --skill backend-engineering --option backend-engineering:node-typescript --skill backend-review --project-dir /Users/ivansosnovich/Documents/codex/moy-mir --skills-dir agentSkills --agent-file AGENTS.md --project-rules none --dry-run`. Реальная установка — после проверки выбора, с `--yes` вместо `--dry-run`.

Каждый сервис и внутренний модуль имеет `techDocs/services/<id>/context.md`: назначение, владелец данных, API/события, зависимости, инварианты, стек и статус, необходимые скилы, проверки и следующий шаг. Перед работой агент читает корневые правила, текущий этап, свой контекст, согласованные ADR и контракты. Локальные AGENTS.md уже созданы в подготовленных каталогах; они ссылаются на контексты. После изменения обновлять документацию и контекст в той же задаче. Контекст не должен расходиться с реальным состоянием: отдельно перечислять planned/implemented/verified.

## Подготовленные каталоги

- `agentSkills/` — общая установка 11 скилов.
- `services/core/modules/{community,planning,communication,training,collaboration,notifications}/` — внутренние модули основного backend.
- `services/identity/`, `services/media/` — отдельные backend-сервисы.
- `apps/frontend/modules/{shell,social,planner,messenger,training,collaboration}/` — разделы единого frontend.
- `infra/` — инструкции для будущего DevOps-этапа.
- `techDocs/design/` — инструкции для этапа дизайна.

В рабочих каталогах только AGENTS.md: пакеты, зависимости, схемы БД и код не создавались. Структура внутри будущего исходного кода уточняется на соответствующем этапе. Установка выполнена штатным `install.py` после успешного dry-run, с `--project-rules none`; исходный каталог скилов не изменялся.

## Execution State

Добавлен по прямому запросу пользователя 2026-09-15 из `/Users/ivansosnovich/Documents/codex/skils/skills/execution-state`. Установщик сохраняет policy в `.agent-skills-lab/policy.json` и манифесте; корневой и локальные AGENTS.md закрепляют обязанность агента.

Все задачи с кодом (включая тесты, ревью, миграции, генераторы и инфраструктуру) проходят через скил до изменений. Короткая задача может выбрать passthrough без state; длительная использует lite/reset и контрольные точки. Эта адаптация предусмотрена самим скилом. Общий scope all_tasks выбран из поддерживаемых установщиком режимов: отдельного code_tasks нет. Режим instructions не является техническим запретом tool calls.

Установка и проверка выполнены; скил доступен по проектным инструкциям со следующего хода. Применение к данной короткой задаче настройки — passthrough, отдельный state не требуется.
