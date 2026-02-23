import { defineConfig } from 'astro/config';

// https://astro.build/config
// GitHub Pages: для user/organization page (username.github.io) или кастомного домена — base: '/'
// Для project page (username.github.io/repo-name/) — base: '/repo-name/'
export default defineConfig({
  site: 'https://vasilyaleev.ru',
  base: '/',
  output: 'static',
});
