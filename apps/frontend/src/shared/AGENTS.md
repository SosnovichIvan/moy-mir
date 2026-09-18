# Shared frontend

Прочитать [контекст frontend](../../../../techDocs/services/frontend/context.md) и родительский AGENTS.md.

Общий код не импортирует app, предметные модули и их API. `config/apiBaseUrl.ts` — техническая проверка публичного build-time параметра, не предметная модель. Модели/DTO генерируются по общим правилам. Проверки собственного кода — 100% на файл через `npm run check`; browser smoke — `npm run build && npm run test:e2e`.
