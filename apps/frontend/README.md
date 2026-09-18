# Frontend «Мой МИР»

Технический каркас A–B: одна React SPA, без продуктовых функций и API. [ADR и границы](../../techDocs/architecture/ADR-002-frontend-foundation.md), [задачи](../../techDocs/services/frontend/bootstrap-tasks.md).

## Установка и проверки

Node 24.12.0 (`.nvmrc`) и npm 11.6.2; совместимые диапазоны закреплены в `package.json`. Все команды ниже — из `apps/frontend`.

```sh
npm ci
npm run check
npm run build
npx playwright install chromium
npm run test:e2e
```

Lockfile хранится в Git. Backend для запуска не требуется. Сборка создаёт статический `dist/`. В Linux для браузерных тестов может понадобиться `npx playwright install --with-deps chromium`.

## Dev и preview

```sh
npm run dev
# либо другой порт
npm run dev -- --port 5180
# явно открыть доступ в локальной сети
npm run dev:lan
```

Dev: `http://127.0.0.1:5173`. HMR обновляет код без полного перезапуска страницы. С телефона в той же сети открыть `http://<LAN-IP-компьютера>:5173`; доступ зависит от firewall. Проверена работа сервера и HMR в Chromium, физический телефон не проверен. При занятом порте команда завершается ошибкой.

```sh
npm run build
npm run preview
```

Preview: `http://127.0.0.1:4173`, другой порт: `npm run preview -- --port 4180`. Preview служит локальной проверке статической сборки. Production-хостинг будет отдельным решением; он должен отдавать `index.html` для маршрутов SPA, сохраняя обработку статических файлов и будущего API.

Маршруты каркаса: `/`, `/about/project`, остальные показывают «Страница не найдена». Прямые ссылки, refresh и история проверены в production-preview. SPA-экран неизвестного адреса не означает HTTP-статус 404: локальный fallback возвращает HTML с 200.

## Окружение

При необходимости скопировать `.env.example` в `.env.local`:

```dotenv
VITE_API_BASE_URL=/api
```

Параметр необязательный: по умолчанию `/api`. Допускаются корневой путь из букв/цифр/`_`/`-`/`/` или HTTP(S) URL без credentials, query и fragment. Неверное значение останавливает dev/build с сообщением `VITE_API_BASE_URL`. Это заготовка для API-клиента R1: каркас пока не выполняет сетевые запросы.

Все `VITE_*` публичны и подставляются **при сборке**, секреты здесь запрещены. Для изменения адреса в готовом приложении нужна новая сборка; смена окружения preview не меняет уже собранный bundle. После правки `.env` перезапустить dev. `.env.local` и `.env.*.local` не коммитить. Runtime-конфигурация с отдельным endpoint пока не реализована.

## Код и каталог

- `src/main.tsx` — React, BrowserRouter и глобальный CSS.
- `src/app/` — композиция маршрутов; alias `@app`.
- `src/shared/config/` — валидатор публичной настройки API.
- `modules/` — инструкции предметных модулей; реализации пока нет.
- `src/shared/ui/` — общие темы, SVG и Icon; `catalog/` — Storybook.

Formatter: `npm run format`; проверка без изменений: `npm run format:check`. Стартовые экраны не являются финальным дизайном. PWA и продуктовые функции относятся к следующим задачам.

## Тесты и CI

`npm test` — разовый прогон; `npm run test:watch` — разработка; `npm run test:coverage` — покрытие. `npm run check` включает lint, typecheck, форматирование и coverage. Vitest/Testing Library используют jsdom и настоящий React renderer.

Для собственного runtime-кода закреплён блокирующий порог **100% lines/statements/functions/branches на каждый файл**. [Правила и исключения](../../techDocs/process/testing.md). Текущая основа: 28 unit-тестов, четыре runtime-файла с покрытием 100%; barrel index.ts содержит только экспорты. Каталог проверяют 9 браузерных тестов. Playwright запускает два smoke-теста production-сборки в Chromium: desktop и эмуляция Pixel 7. Это не проверка всей целевой браузерной матрицы или будущих функций.

Отчёты: `coverage/index.html`, `coverage/coverage-summary.json`, `coverage/lcov.info`, `playwright-report/index.html`; при падении E2E сохраняется trace. Все отчёты исключены из Git.

[Workflow Frontend](../../.github/workflows/frontend.yml) выполняет установку по lockfile, `check`, production build и браузерные тесты на PR в `main`/`develop`, а также push этих веток. Артефакты `frontend-quality-reports` и `frontend-dist` хранятся 14 дней. Ошибка шага завершает проверку неуспешно. Каталог собирается и проверяется отдельными шагами; артефакт `frontend-catalog` хранится 14 дней. Обязательность статуса для merge задаётся отдельно правилами GitHub.

## Диагностика

- `EBADENGINE`: сверить Node/npm с `.nvmrc` и `packageManager`, затем `npm ci`.
- Занят порт: остановить свой предыдущий сервер либо передать `--port`; тесты ожидают свободные 4173 и 6006.
- Нет браузера Playwright: выполнить `npx playwright install chromium`.
- Preview показывает старый код: сначала повторить `npm run build`.
- Ошибка вложенного URL на внешнем хостинге: проверить SPA fallback на `index.html`.
- Ошибка coverage: открыть HTML-отчёт и добавить сценарий для непокрытого поведения; не снижать порог и не скрывать файл.

## Каталог и UI-контракты

- `npm run catalog` — Storybook на http://127.0.0.1:6006.
- `npm run catalog:build` / `npm run catalog:preview` — статическая сборка и просмотр.
- `npm run test:catalog` — браузерные проверки собранного каталога.
- `npm run generate:ui` / `npm run generate:check` — генерация UI-типов / проверка diff.

Обзор основ содержит Light/Dark, viewport 320/390/768/1440, шрифты, палитру, размеры и иконки. Icon имеет controls имени и размера. Управляющие компоненты следуют в блоке D.
[Токены, Figma ID, контракты и правила синхронизации](../../techDocs/services/frontend/ui-foundations.md).
