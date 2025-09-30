# n8n-codex-pipeline (Pro Scaffold)

Готовая основа для CI/CD: **GitHub → n8n (REST API) → смоук‑тесты**.  
Подходит для сценария, где ChatGPT ("Codex") создаёт PR с JSON‑воркфлоу, а после мерджа всё автоматически деплоится и проверяется.

## Возможности
- Автодеплой JSON‑воркфлоу из `workflows/*.json` в ваш n8n.
- Валидация структур JSON своим валидатором (`scripts/validate_workflows.js`) + `jq`.
- Смоук‑тест вебхука Node‑скриптом (`scripts/run_webhook_smoke.js`) и/или bash‑скриптом.
- Шаблоны PR/Issues, базовые нормы проекта (.editorconfig, .gitattributes).
- Подробная инструкция в `docs/SETUP_GUIDE_RU.md` (шаги “как для ребёнка”).

## Структура
```
.workflows/
  example_hello_webhook.json
.github/
  workflows/
    deploy.yml
    pr-checks.yml
  ISSUE_TEMPLATE/
    bug_report.md
    feature_request.md
docs/
  SETUP_GUIDE_RU.md
scripts/
  validate_workflows.js
  run_webhook_smoke.js
  smoke_test.sh
.editorconfig
.gitattributes
.gitignore
LICENSE
README.md
CODEOWNERS
CONTRIBUTING.md
SECURITY.md
CHANGELOG.md
```

## Быстрый старт
1. Прочитайте `docs/SETUP_GUIDE_RU.md`.
2. Создайте секреты: `N8N_BASE_URL`, `N8N_API_KEY`, `N8N_TEST_WEBHOOK_URL`.
3. Сделайте любой коммит в `main` → деплой выполнится сам.
4. Проверьте, что воркфлоу активен и вебхук отвечает 2xx.

## Скрипты (CI использует их автоматически)
- `node scripts/validate_workflows.js` — строгая проверка JSON‑воркфлоу.
- `node scripts/run_webhook_smoke.js <URL>` — смоук POST на вебхук и проверка JSON ответа.
- `bash scripts/smoke_test.sh <URL>` — облегчённый смоук без Node.

## Лицензия
MIT
