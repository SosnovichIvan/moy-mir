import { expect, test } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  for (const width of [320, 390, 768, 1440]) {
    test(`${theme} fields fit ${width}px`, async ({ page }, testInfo) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/iframe.html?id=field--${theme}&viewMode=story`);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBe(width);
      for (const [size, height, multiline] of [
        ['S', 44, 96],
        ['M', 48, 112],
        ['L', 56, 144],
      ] as const) {
        const section = page.getByRole('region', {
          name: `Размер ${size}`,
          exact: true,
        });
        for (const name of [
          'Электронная почта',
          'Найти друга',
          'Пароль',
          'Видимость',
        ]) {
          await expect(section.getByLabel(name, { exact: true })).toHaveCSS(
            'height',
            `${height}px`,
          );
        }
        await expect(section.getByLabel('Описание', { exact: true })).toHaveCSS(
          'height',
          `${multiline}px`,
        );
        for (const action of await section.getByRole('button').all()) {
          const box = (await action.boundingBox())!;
          expect(box.width).toBe(44);
          expect(box.height).toBe(44);
        }
      }
      await expect(
        page.getByLabel('Выбор с ошибкой', { exact: true }),
      ).toHaveCSS('height', '48px');
      await page.screenshot({
        path: testInfo.outputPath('fields.png'),
        fullPage: true,
      });
      expect(errors).toEqual([]);
    });
  }

  test(`${theme} keyboard editing, clearing, password selection and validation`, async ({
    page,
  }, testInfo) => {
    await page.goto(`/iframe.html?id=field--${theme}&viewMode=story`);
    const form = page.getByRole('form', { name: 'Попробовать поля' });
    const name = form.getByLabel('Ваше имя', { exact: true });
    await name.fill('Анна');
    await name.hover();
    await expect(name.locator('..')).toHaveCSS('box-shadow', /2px/);
    await name.press('Tab');
    const clear = form.getByRole('button', {
      name: 'Очистить поле «Ваше имя»',
    });
    await expect(clear).toBeFocused();
    await clear.press('Enter');
    await expect(name).toHaveValue('');
    await expect(name).toBeFocused();
    await expect(
      form.getByRole('status', { name: 'Результат проверки' }),
    ).toHaveText('Проверка не запускалась');
    const password = form.getByLabel('Ваш пароль');
    await password.focus();
    await password.evaluate((e: HTMLInputElement) => e.setSelectionRange(2, 6));
    await password.press('Tab');
    await form.getByRole('button', { name: 'Показать пароль' }).press('Space');
    await expect(password).toHaveAttribute('type', 'text');
    await expect(password).toBeFocused();
    expect(
      await password.evaluate((e: HTMLInputElement) => [
        e.selectionStart,
        e.selectionEnd,
      ]),
    ).toEqual([2, 6]);
    await form.getByRole('button', { name: 'Скрыть пароль' }).click();
    await expect(password).toHaveAttribute('type', 'password');
    await expect(password).toHaveValue('Example password');
    const select = form.getByLabel('Кто увидит запись');
    await select.focus();
    await expect(select).toBeFocused();
    // Headless Chromium on this host does not operate native select popups by keys,
    // including a plain select without React. Exercise its change contract directly.
    await select.selectOption('friends');
    await expect(select).toHaveValue('friends');
    await form.getByLabel('Ваши планы').fill('Первая строка\nВторая строка');
    await expect(form.getByLabel('Ваши планы')).toHaveValue(
      'Первая строка\nВторая строка',
    );
    await form.getByRole('button', { name: 'Проверить имя' }).click();
    await expect(name).toHaveAccessibleDescription(
      'Введите имя, чтобы продолжить',
    );
    await expect(name).toHaveAttribute('aria-invalid', 'true');
    await name.focus();
    await name.hover();
    const control = name.locator('..');
    await expect(control).toHaveCSS('outline-width', '2px');
    await expect(control).toHaveCSS('outline-offset', '2px');
    await expect(control).toHaveCSS(
      'box-shadow',
      new RegExp(theme === 'light' ? '165, 46, 53' : '255, 179, 184'),
    );
    await page.screenshot({
      path: testInfo.outputPath('field-error-focus.png'),
      fullPage: true,
    });
    await name.fill('Анна');
    await expect(name).toHaveAttribute('aria-invalid', 'false');
  });
}

test('200% text reflows; readonly remains keyboard accessible and disabled is skipped', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/iframe.html?id=field--light&viewMode=story');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '32px';
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    320,
  );
  const section = page.getByRole('region', { name: 'Размер S', exact: true });
  const textarea = section.getByLabel('Описание', { exact: true });
  await textarea.focus();
  await textarea.press('Tab');
  const readonly = section.getByLabel('Только просмотр', { exact: true });
  await expect(readonly).toBeFocused();
  await readonly.press('End');
  await readonly.press('X');
  await expect(readonly).toHaveValue('ivan@example.ru');
  await expect(section.getByLabel('Недоступное поле')).toBeDisabled();
});

test('forced colors keeps field boundaries and focus', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/iframe.html?id=field--dark&viewMode=story');
  const input = page.getByRole('form').getByLabel('Ваше имя', { exact: true });
  await input.focus();
  await expect(input.locator('..')).toHaveCSS('outline-style', 'solid');
  await expect(input.locator('..')).toHaveCSS('outline-width', '2px');
});

test.describe('touch fields', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  test('clear and password actions are usable by touch', async ({ page }) => {
    await page.goto('/iframe.html?id=field--dark&viewMode=story');
    const form = page.getByRole('form');
    const input = form.getByLabel('Ваше имя', { exact: true });
    await input.fill('Анна');
    await form.getByRole('button', { name: /Очистить/ }).tap();
    await expect(input).toHaveValue('');
    await expect(input).toBeFocused();
    await form.getByRole('button', { name: 'Показать пароль' }).tap();
    await expect(form.getByLabel('Ваш пароль')).toHaveAttribute('type', 'text');
  });
});
