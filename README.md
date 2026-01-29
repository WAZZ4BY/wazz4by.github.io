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
- `/admin/` - Админка (добавление, редактирование, удаление проектов)

## Проекты и админка

- Данные проектов хранятся в `public/data/projects.json`.
- **Админка** (Astro): **https://ваш-сайт/admin/** — вход по паролю (по умолчанию: `admin`; изменить: в `src/pages/admin/index.astro` и в `src/pages/admin/add/index.astro`, `src/pages/admin/edit.astro` — переменная `PASSWORD`).

Возможности админки:

1. **Список проектов** (`/admin/`) — ссылки «Редактировать» и «Удалить», кнопка «+ Добавить проект».
2. **Добавить проект** (`/admin/add/`) — форма: название, тип, год, описание, изображения (URL). После «Сохранить проект» происходит переход в список; новые/изменённые данные нужно отправить в репозиторий (см. ниже).
3. **Редактировать проект** (`/admin/edit/?id=slug`) — форма с полями проекта и **сеткой изображений**: добавление/удаление URL, кнопки «↑»/«↓» и перетаскивание (drag-and-drop) для смены порядка. Сохранение — в черновик в браузере; для обновления сайта нужно сохранить в GitHub со страницы списка.
4. **Сохранение в GitHub** — на странице `/admin/` укажите репозиторий (например, `wazz4by/wazz4by.github.io`) и **GitHub Personal Access Token** (права `repo`), затем нажмите «Сохранить в GitHub». Файл `public/data/projects.json` будет закоммичен в ветку `main`; деплой выполнит существующий GitHub Actions workflow.
5. **Резервная копия** — кнопка «Скачать projects.json» для ручной замены файла в репозитории.

На каждой странице проекта на сайте есть ссылка «Редактировать» в админку.

## Деплой на GitHub Pages

Проект настроен для деплоя на GitHub Pages. Конфигурация в `astro.config.mjs`:

```js
export default defineConfig({
  output: 'static',
  site: 'https://wazz4by.github.io',
  base: '/',
});
```

### 1. Обновление `projects.json` и сборка (локально)

Скрипт копирует новый `projects.json` в `public/data/`, собирает проект и опционально деплоит в ветку `gh-pages`:

```bash
# Только скопировать файл и собрать проект (деплой не выполняется)
node scripts/update-projects-and-deploy.js путь/к/projects.json

# То же + задеплоить в ветку gh-pages
node scripts/update-projects-and-deploy.js путь/к/projects.json --deploy
```

Или через npm:

```bash
npm run update-and-deploy -- путь/к/projects.json
npm run update-and-deploy -- путь/к/projects.json -- --deploy
```

Если путь не указан, копирование пропускается, выполняется только `npm run build`.

### 2. Автоматический деплой через GitHub Actions

Workflow `.github/workflows/deploy.yml`:

- **Запускается** при пуше в `main`, если изменились:
  - `public/data/projects.json`
  - файлы в `src/`, `public/`
  - `astro.config.mjs`, `package.json`, `package-lock.json`
- **Действия:** сборка (`npm run build`), публикация папки `dist/` в ветку **`gh-pages`** (action `peaceiris/actions-gh-pages`).

Ручной запуск: в репозитории **Actions** → **Deploy Astro to GitHub Pages** → **Run workflow**.

### 3. Секреты и токены

- **В GitHub Actions** дополнительных секретов создавать не нужно. Используется встроенный `GITHUB_TOKEN` (доступен как `secrets.GITHUB_TOKEN`), его выдаёт GitHub для каждого запуска workflow.
- **Локальный деплой** (`npm run deploy` или скрипт с `--deploy`) требует прав на запись в репозиторий: либо вы залогинены через `gh auth login` / `git` с учётными данными, либо нужен [Personal Access Token (classic)](https://github.com/settings/tokens) с правом `repo` для HTTPS.

### 4. Настройка GitHub Pages в репозитории

Чтобы сайт открывался из ветки `gh-pages`:

1. **Settings** → **Pages**.
2. **Source:** выберите **Deploy from a branch**.
3. **Branch:** `gh-pages`, папка **/ (root)**.
4. Сохраните. После первого успешного деплоя сайт будет доступен по адресу вида `https://<username>.github.io/<repo>/` (для репозитория `username.github.io` — по корневому URL).

### Ручной деплой (без скрипта)

1. Сборка: `npm run build`
2. Публикация в `gh-pages`: `npm run deploy` (пакет `gh-pages` зальёт содержимое `dist/` в ветку `gh-pages`)
