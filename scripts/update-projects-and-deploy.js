#!/usr/bin/env node
/**
 * Скрипт обновления projects.json и деплоя на GitHub Pages.
 *
 * Использование:
 *   node scripts/update-projects-and-deploy.js [путь/к/projects.json]
 *
 * 1. Если указан путь к файлу — копирует его в public/data/projects.json.
 * 2. Запускает сборку (npm run build).
 * 3. Опционально: деплой в ветку gh-pages (npm run deploy).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, 'public', 'data');
const targetFile = path.join(dataDir, 'projects.json');

const sourcePath = process.argv[2];

function copyProjectsJson() {
  if (!sourcePath) {
    console.log('Путь к projects.json не указан. Пропуск копирования.');
    return;
  }
  const absoluteSource = path.isAbsolute(sourcePath)
    ? sourcePath
    : path.resolve(process.cwd(), sourcePath);
  if (!fs.existsSync(absoluteSource)) {
    console.error('Файл не найден:', absoluteSource);
    process.exit(1);
  }
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.copyFileSync(absoluteSource, targetFile);
  console.log('Скопировано:', absoluteSource, '->', targetFile);
}

function build() {
  console.log('Запуск сборки: npm run build');
  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
}

function deploy() {
  console.log('Запуск деплоя в ветку gh-pages: npm run deploy');
  execSync('npm run deploy', { cwd: rootDir, stdio: 'inherit' });
}

copyProjectsJson();
build();

const doDeploy = process.argv.includes('--deploy');
if (doDeploy) {
  deploy();
} else {
  console.log('\nЧтобы задеплоить в ветку gh-pages локально, запустите: npm run deploy');
  console.log('Или запустите скрипт с флагом --deploy: node scripts/update-projects-and-deploy.js [файл] --deploy');
}
