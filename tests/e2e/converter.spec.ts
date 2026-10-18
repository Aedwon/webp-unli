// tests/e2e/converter.spec.ts
import { test, expect } from '@playwright/test';
import path from 'path';

const FIXTURES = path.resolve(__dirname, '../fixtures');

test.describe('Unlimited WebP Converter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for wasm-vips to finish loading
    await page.waitForSelector('h1', { timeout: 30000 });
  });

  test('shows the main UI after loading', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Unlimited WebP Converter');
    await expect(page.locator('h1')).toContainText('by Aedwon');
    await expect(page.getByText('Drop images to convert')).toBeVisible();
  });

  test('converts a PNG file to WebP and enables download', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(path.join(FIXTURES, 'sample.png'));

    await expect(page.getByRole('heading', { name: 'sample.png' })).toBeVisible();
    await page.getByRole('button', { name: 'Convert', exact: true }).click();

    await expect(page.getByRole('button', { name: 'Download', exact: true })).toBeVisible({ timeout: 30000 });
  });

  test('converts a JPG file to WebP', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(path.join(FIXTURES, 'sample.jpg'));

    await page.getByRole('button', { name: 'Convert', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Download', exact: true })).toBeVisible({ timeout: 30000 });
  });

  test('shows Download all when multiple files are done', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles([
      path.join(FIXTURES, 'sample.png'),
      path.join(FIXTURES, 'sample.jpg'),
    ]);

    await page.getByRole('button', { name: 'Convert 2 images' }).click();

    await expect(page.getByRole('button', { name: /Download all/ })).toBeVisible({ timeout: 30000 });
  });

  test('removes a file from the queue when X is clicked', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(path.join(FIXTURES, 'sample.png'));

    await expect(page.getByRole('heading', { name: 'sample.png' })).toBeVisible();
    await page.getByRole('button', { name: 'Remove sample.png' }).click();
    await expect(page.getByRole('heading', { name: 'sample.png' })).not.toBeVisible();
    await expect(page.getByText('Drop images to convert')).toBeVisible();
  });

  test('settings panel appears after adding files', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(path.join(FIXTURES, 'sample.png'));

    await expect(page.getByText('Quality', { exact: true })).toBeVisible();
    await expect(page.getByText('Lossless', { exact: true })).toBeVisible();
    await expect(page.getByText('Remove metadata', { exact: true })).toBeVisible();
  });
});
