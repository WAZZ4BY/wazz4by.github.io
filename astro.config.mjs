import { defineConfig } from 'astro/config';

// https://astro.build/config
// Для user/organization pages (username.github.io) base должен быть '/'
// Для project pages (username.github.io/repo-name) base должен быть '/repo-name'
export default defineConfig({
  output: 'static',
  site: 'https://wazz4by.github.io',
  base: '/',
});
