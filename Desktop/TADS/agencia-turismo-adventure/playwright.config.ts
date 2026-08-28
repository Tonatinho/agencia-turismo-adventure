import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://127.0.0.1', // Agora é HTTP puro, porta 80, caminho livre!
    ignoreHTTPSErrors: true,
    headless: true,
  },
});