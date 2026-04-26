// tests/e2e/converter.spec.ts
import { test, expect } from '@playwright/test';
import path from 'path';

const FIXTURES = path.resolve(__dirname, '../fixtures');

test.describe('Image to WebP Converter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for wasm-vips to finish loading
    await page.waitForSelector('text=Image → WebP', { timeout: 30000 });
  });

  test('shows the main UI after loading', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Image → WebP');
    await expect(page.locator('text=browse files')).toBeVisible();
  });

  test('converts a PNG file to WebP and enables download', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(FIXTURES, 'sample.png'));

    await expect(page.locator('text=sample.png')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Convert' })).toBeVisible();

    await page.click('button:has-text("Convert")');

    await expect(page.locator('button:has-text("Download .webp")')).toBeVisible({ timeout: 30000 });
  });

  test('converts a JPG file to WebP', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(FIXTURES, 'sample.jpg'));

    await page.click('button:has-text("Convert")');
    await expect(page.locator('button:has-text("Download .webp")')).toBeVisible({ timeout: 30000 });
  });

  test('shows Download All button when multiple files are done', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles([
      path.join(FIXTURES, 'sample.png'),
      path.join(FIXTURES, 'sample.jpg'),
    ]);

    await page.click('button:has-text("Convert All")');

    await expect(page.locator('button:has-text("Download All")')).toBeVisible({ timeout: 30000 });
  });

  test('removes a file from the queue when X is clicked', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(FIXTURES, 'sample.png'));

    await expect(page.locator('text=sample.png')).toBeVisible();
    await page.click('[title="Remove file"]');
    await expect(page.locator('text=sample.png')).not.toBeVisible();
  });

  test('conversion controls panel appears after adding files', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(FIXTURES, 'sample.png'));

    await expect(page.locator('text=Quality')).toBeVisible();
    await expect(page.locator('text=Lossless')).toBeVisible();
    await expect(page.locator('text=Strip metadata')).toBeVisible();
  });
});
