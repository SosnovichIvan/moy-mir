import { expect, test } from '@playwright/test';

for (const theme of ['light', 'dark'] as const) {
  for (const width of [320, 390, 768, 1440]) {
    test(`${theme} buttons fit ${width}px`, async ({ page }, testInfo) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/iframe.html?id=button--${theme}&viewMode=story`);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBe(width);
      for (const variant of ['primary', 'secondary', 'danger']) {
        const region = page.getByRole('region', { name: variant, exact: true });
        for (const [size, height] of [
          ['S', 44],
          ['M', 48],
          ['L', 56],
        ] as const) {
          const button = region.getByRole('button', {
            name: `Продолжить ${size}`,
            exact: true,
          });
          await expect(button).toHaveCSS('height', `${height}px`);
          await expect(button).toHaveCSS('border-radius', '16px');
        }
        const long = region.getByRole('button', { name: /Пригласить друзей/ });
        const bounds = (await long.boundingBox())!;
        expect(bounds.height).toBeGreaterThan(48);
        for (const glyph of await long.locator('.mm-icon').all()) {
          const icon = (await glyph.boundingBox())!;
          expect(icon.width).toBe(20);
          expect(
            Math.abs(icon.y + icon.height / 2 - bounds.y - bounds.height / 2),
          ).toBeLessThan(1);
          await expect(glyph).toHaveCSS(
            'color',
            await long.evaluate((e) => getComputedStyle(e).color),
          );
        }
      }
      const icons = page.getByRole('region', { name: 'IconButton' });
      for (const [size, dimension] of [
        ['S', 44],
        ['M', 48],
        ['L', 56],
      ] as const) {
        const button = icons.getByRole('button', {
          name: `Добавить ${size}`,
          exact: true,
        });
        await expect(button).toHaveCSS('width', `${dimension}px`);
        await expect(button).toHaveCSS('height', `${dimension}px`);
        await expect(button).toHaveCSS('border-radius', '12px');
        await expect(button.locator('.mm-icon')).toHaveCSS(
          'width',
          size === 'L' ? '24px' : '20px',
        );
      }
      await page.screenshot({
        path: testInfo.outputPath('buttons.png'),
        fullPage: true,
      });
      expect(errors).toEqual([]);
    });
  }

  test(`${theme} hover, press, focus and loading stay independent`, async ({
    page,
  }, testInfo) => {
    await page.goto(`/iframe.html?id=button--${theme}&viewMode=story`);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    const tokens = await page.locator('html').evaluate((e) => {
      const style = getComputedStyle(e);
      const names = [
        'accent',
        'hover',
        'ink',
        'onAccent',
        'onPressed',
        'soft',
        'line',
        'danger',
        'dangerSoft',
        'muted',
      ];
      return Object.fromEntries(
        names.map((name) => {
          const probe = document.createElement('span');
          probe.style.color = style.getPropertyValue(`--mm-${name}`);
          document.body.append(probe);
          const value = getComputedStyle(probe).color;
          probe.remove();
          return [name, value];
        }),
      );
    });
    for (const variant of ['primary', 'secondary', 'danger']) {
      const region = page.getByRole('region', { name: variant, exact: true });
      const button = region.getByRole('button', {
        name: 'Продолжить M',
        exact: true,
      });
      await button.focus();
      await button.press('Tab');
      await page.keyboard.press('Shift+Tab');
      await expect(button).toBeFocused();
      await expect(button).toHaveCSS('outline-width', '2px');
      await expect(button).toHaveCSS('outline-offset', '-2px');
      await button.hover();
      await expect(button).toHaveCSS(
        'background-color',
        tokens[
          variant === 'primary'
            ? 'hover'
            : variant === 'secondary'
              ? 'line'
              : 'dangerSoft'
        ]!,
      );
      await expect(button).toHaveCSS('outline-style', 'solid');
      await page.mouse.down();
      await expect(button).toHaveCSS(
        'background-color',
        tokens[
          variant === 'primary'
            ? 'ink'
            : variant === 'secondary'
              ? 'accent'
              : 'danger'
        ]!,
      );
      await expect(button).toHaveCSS('outline-width', '2px');
      await page.mouse.up();
      await button.press('Space');
      await button.press('Enter');
      const disabled = region.getByRole('button', {
        name: 'Недоступно',
        exact: true,
      });
      await expect(disabled).toBeDisabled();
      await disabled.hover();
      await expect(disabled).toHaveCSS('background-color', tokens.line!);
      await expect(disabled).toHaveCSS('color', tokens.muted!);
      const loading = region.getByRole('button', { name: 'Подождите…' });
      await expect(loading).toBeDisabled();
      await loading.hover();
      await expect(loading).toHaveCSS(
        'background-color',
        tokens[
          variant === 'primary'
            ? 'accent'
            : variant === 'secondary'
              ? 'soft'
              : 'dangerSoft'
        ]!,
      );
    }
    await expect(
      page.getByRole('status', { name: 'Количество действий' }),
    ).toHaveText('9');
    const start = page.getByRole('button', { name: 'Начать действие' });
    await start.dblclick();
    await expect(
      page.getByRole('status', { name: 'Количество действий' }),
    ).toHaveText('10');
    const action = page.getByRole('region', { name: 'Действие' });
    await expect(
      action.getByRole('button', { name: 'Подождите…' }),
    ).toBeDisabled();
    await action
      .getByRole('button', { name: 'Завершить демонстрацию' })
      .click();
    await expect(start).toBeEnabled();
    await page.screenshot({
      path: testInfo.outputPath('button-interaction.png'),
      fullPage: true,
    });
  });
}

test('200% text wraps and keyboard skips unavailable buttons', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/iframe.html?id=button--light&viewMode=story');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '32px';
  });
  const region = page.getByRole('region', { name: 'primary', exact: true });
  const both = region.getByRole('button', { name: 'С обеих сторон' });
  await both.focus();
  await both.press('Tab');
  await expect(
    region.getByRole('button', { name: /Пригласить друзей/ }),
  ).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    320,
  );
  expect((await both.boundingBox())!.height).toBeGreaterThan(48);
});

test('forced colors retains button boundaries, icons and focus', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/iframe.html?id=button--dark&viewMode=story');
  const button = page.getByRole('button', { name: 'Добавить M', exact: true });
  await button.press('Space');
  await expect(button).toHaveCSS('border-width', '1px');
  await expect(button).toHaveCSS('outline-width', '2px');
  await expect(button.locator('.mm-icon')).toHaveCSS(
    'forced-color-adjust',
    'none',
  );
  await expect(
    page.getByRole('status', { name: 'Количество действий' }),
  ).toHaveText('1');
});

test.describe('touch', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  test('activates without sticky hover and blocks loading taps', async ({
    page,
  }) => {
    await page.goto('/iframe.html?id=button--dark&viewMode=story');
    const button = page
      .getByRole('region', { name: 'primary', exact: true })
      .getByRole('button', { name: 'Продолжить M' });
    await button.tap();
    await expect(button).toHaveCSS('background-color', 'rgb(145, 200, 163)');
    await expect(
      page.getByRole('status', { name: 'Количество действий' }),
    ).toHaveText('1');
    const start = page.getByRole('button', { name: 'Начать действие' });
    await start.tap();
    const busy = page
      .getByRole('region', { name: 'Действие' })
      .getByRole('button', { name: 'Подождите…' });
    const box = (await busy.boundingBox())!;
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    await expect(
      page.getByRole('status', { name: 'Количество действий' }),
    ).toHaveText('2');
  });
});

test('buttons use content width, balance a single icon and retain size while busy', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/iframe.html?id=button--light&viewMode=story');
  const region = page.getByRole('region', { name: 'primary', exact: true });
  for (const name of ['Продолжить M', 'Слева', 'Справа', 'С обеих сторон']) {
    const button = region.getByRole('button', { name, exact: true });
    const bounds = (await button.boundingBox())!;
    const container = (await region.boundingBox())!;
    expect(bounds.width).toBeGreaterThanOrEqual(96);
    expect(bounds.width).toBeLessThan(container.width - 40);
    const label = (await button.locator('.mm-button-label').boundingBox())!;
    expect(
      Math.abs(label.x + label.width / 2 - bounds.x - bounds.width / 2),
    ).toBeLessThan(1);
  }
  const action = page.getByRole('region', { name: 'Действие' });
  const button = action.getByRole('button', { name: 'Начать действие' });
  const before = (await button.boundingBox())!;
  await button.click();
  const busy = action.getByRole('button', { name: 'Подождите…' });
  const after = (await busy.boundingBox())!;
  expect(after.width).toBe(before.width);
  expect(after.height).toBe(before.height);
  await expect(busy.locator('.mm-button-content')).toBeHidden();
  for (const target of [
    busy,
    page.getByRole('button', { name: 'Загрузка', exact: true }),
  ]) {
    const spinner = target.locator('.mm-button-loading');
    await expect(spinner).toBeVisible();
    await expect(spinner).toHaveCSS('animation-name', 'mm-button-spin');
    const bounds = (await target.boundingBox())!;
    const glyph = (await spinner.boundingBox())!;
    expect(
      Math.abs(glyph.x + glyph.width / 2 - bounds.x - bounds.width / 2),
    ).toBeLessThan(1);
    expect(
      Math.abs(glyph.y + glyph.height / 2 - bounds.y - bounds.height / 2),
    ).toBeLessThan(1);
    const transform = await spinner.evaluate(
      (e) => getComputedStyle(e).transform,
    );
    await expect
      .poll(() => spinner.evaluate((e) => getComputedStyle(e).transform))
      .not.toBe(transform);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(busy.locator('.mm-button-loading')).toHaveCSS(
    'animation-name',
    'none',
  );
});
