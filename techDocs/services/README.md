# Контексты сервисов и внутренних модулей

Единицы развёртывания: core, identity, media и frontend. Остальные записи — контексты внутренних модулей, не отдельных микросервисов/MFE. Gateway как самостоятельный сервис исключён; его входная функция принадлежит core и инфраструктурному reverse proxy. Код отсутствует.

- [core — Основной backend](core/context.md): Самостоятельный модульный backend; функциональность поставляется в R1–R5.
- [identity — Авторизация](identity/context.md): Отдельный backend V1.
- [media — Хранение файлов](media/context.md): Отдельный backend V1, не отложенный сервис.
- [community — Профили, друзья, группы и лента](community/context.md): Внутренний модуль core, не отдельный сервис.
- [planning — Планы, события и календарь](planning/context.md): Внутренний модуль core, не отдельный сервис.
- [communication — Общение](communication/context.md): Внутренний модуль core, не отдельный сервис.
- [training — Тренировки и журнал](training/context.md): Внутренний модуль core, не отдельный сервис.
- [collaboration — Запросы и внутренние отчёты](collaboration/context.md): Внутренний модуль core, не отдельный сервис.
- [notifications — Уведомления](notifications/context.md): Внутренний модуль core, не отдельный сервис.
- [frontend — Общий frontend](frontend/context.md): Одно модульное приложение с релизами R1–R5.
- [shell — Оболочка приложения](shell/context.md): Внутренний модуль frontend.
- [frontend-social — Социальный раздел](frontend-social/context.md): Внутренний модуль frontend.
- [frontend-planner — Планы и события](frontend-planner/context.md): Внутренний модуль frontend.
- [frontend-messenger — Сообщения](frontend-messenger/context.md): Внутренний модуль frontend.
- [frontend-training — Тренировки и таблица журнала](frontend-training/context.md): Внутренний модуль frontend.
- [frontend-collaboration — Запросы и отчёты](frontend-collaboration/context.md): Внутренний модуль frontend.
