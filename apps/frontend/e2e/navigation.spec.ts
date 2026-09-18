import { expect, test } from '@playwright/test';

test('production SPA supports navigation, history and direct URL refresh', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Мой МИР' })).toBeVisible();
  await page.getByRole('link', { name: 'О проекте' }).click();
  await expect(page).toHaveURL(/\/about\/project$/);
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Мой МИР' })).toBeVisible();
  await page.goto('/about/project');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'О проекте' })).toBeVisible();
  await page.goto('/missing/route');
  await expect(
    page.getByRole('heading', { name: 'Страница не найдена' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'На главную' }).click();
  await expect(page).toHaveURL('/');
  expect(errors).toEqual([]);
});
