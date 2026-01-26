# Портфолио графического дизайнера

Статический сайт портфолио на Astro.

## Установка

```bash
npm install
```

## Разработка

```bash
npm run dev
```

Сайт будет доступен по адресу `http://localhost:4321`

## Сборка

```bash
npm run build
```

Статические файлы будут в папке `dist/`

## Структура проекта

```
├── src/
│   ├── components/      # Компоненты Astro
│   │   ├── SiteHeader.astro
│   │   ├── ViewToggle.astro
│   │   ├── ProjectsGrid.astro
│   │   ├── ProjectsList.astro
│   │   └── ProjectCard.astro
│   ├── layouts/         # Шаблоны страниц
│   │   └── BaseLayout.astro
│   ├── pages/           # Страницы
│   │   ├── index.astro  # Главная страница
│   │   ├── works/       # Страница Works (Index)
│   │   ├── research.astro
│   │   └── me.astro
│   └── styles/
│       └── global.css
├── public/
│   ├── images/          # Изображения
│   └── uploads/         # Загруженные файлы
└── dist/                # Собранный сайт
```

## Маршруты

- `/` - Главная страница (Home)
- `/index` - Index/Works
- `/research` - Research
- `/me` - Me

## Деплой на GitHub Pages

Проект настроен для деплоя на GitHub Pages. Конфигурация находится в `astro.config.mjs`:

```js
export default defineConfig({
  output: 'static',
  site: 'https://wazz4by.github.io',
  base: '/',
});
```

### Автоматический деплой через GitHub Actions

1. Создайте файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/deploy-pages@v4
```

2. В настройках репозитория GitHub включите GitHub Pages (Settings → Pages → Source: GitHub Actions)

### Ручной деплой

1. Соберите проект: `npm run build`
2. Загрузите содержимое папки `dist/` в ветку `gh-pages` или используйте GitHub Actions
