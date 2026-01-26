# Портфолио графического дизайнера

Статический сайт портфолио на Astro с управлением контентом через Decap CMS.

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
│   ├── content/         # Контент (JSON проекты)
│   │   └── projects/
│   ├── layouts/         # Шаблоны страниц
│   └── pages/           # Страницы
│       ├── index.astro  # Главная страница
│       └── project/     # Страницы проектов
├── public/
│   ├── admin/           # Decap CMS
│   ├── images/          # Изображения
│   └── sketches/        # p5 проекты
└── dist/                # Собранный сайт
```

## Управление контентом

Админ-панель Decap CMS доступна по адресу `/admin/`

## GitHub Pages

1. Настройте `site` и `base` в `astro.config.mjs`
2. Соберите проект: `npm run build`
3. Загрузите содержимое `dist/` в ветку `gh-pages` или используйте GitHub Actions
