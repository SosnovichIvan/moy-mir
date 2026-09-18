import { expect, test } from '@playwright/test';

for (const theme of ['light', 'dark'] as const) {
  for (const width of [320, 390, 768, 1440]) {
    test(`${theme} Selection fits ${width}px`, async ({ page }, testInfo) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/iframe.html?id=selection--${theme}&viewMode=story`);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBe(width);
      for (const row of await page.locator('.mm-selection').all()) {
        const bounds = await row.boundingBox();
        expect(bounds?.height).toBeGreaterThanOrEqual(48);
        expect(bounds?.width).toBeGreaterThanOrEqual(44);
        const indicator = row.locator('.mm-selection-indicator');
        await expect(indicator).toHaveCSS('height', '24px');
        const glyph = await indicator.boundingBox();
        expect(
          Math.abs(
            glyph!.y + glyph!.height / 2 - (bounds!.y + bounds!.height / 2),
          ),
        ).toBeLessThan(1);
      }
      await page.keyboard.press('Tab');
      const checkbox = page
        .getByRole('region', { name: 'checkbox' })
        .getByRole('checkbox')
        .first();
      await expect(checkbox).toBeFocused();
      await expect(checkbox.locator('..')).toHaveCSS('outline-width', '2px');
      await expect(checkbox.locator('..')).toHaveCSS('outline-offset', '4px');
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: testInfo.outputPath('selection.png'),
        fullPage: true,
      });
      expect(errors).toEqual([]);
    });
  }

  test(`${theme} pointer and keyboard preserve independent selection states`, async ({
    page,
  }, testInfo) => {
    await page.goto(`/iframe.html?id=selection--${theme}&viewMode=story`);
    const colors =
      theme === 'light'
        ? {
            accent: 'rgb(49, 99, 76)',
            soft: 'rgb(220, 232, 213)',
            line: 'rgb(214, 224, 211)',
            muted: 'rgb(82, 100, 84)',
          }
        : {
            accent: 'rgb(145, 200, 163)',
            soft: 'rgb(38, 60, 48)',
            line: 'rgb(54, 74, 60)',
            muted: 'rgb(168, 188, 174)',
          };

    for (const role of ['checkbox', 'radio', 'switch'] as const) {
      const region = page.getByRole('region', { name: role });
      const input = region.getByRole(role, { name: 'Выключено', exact: true });
      const row = input.locator('..');
      const indicator = row.locator('.mm-selection-indicator');
      await input.focus();
      await page.keyboard.press('Tab');
      await page.keyboard.press('Shift+Tab');
      await expect(input).toBeFocused();
      await expect(row).toHaveCSS('outline-width', '2px');
      await expect(input).not.toBeChecked();
      await row.hover();
      await expect(row).toHaveCSS('background-color', colors.soft);
      await expect(row).toHaveCSS('outline-width', '2px');
      await page.mouse.down();
      await expect(row).toHaveCSS('background-color', colors.line);
      await expect(input).not.toBeChecked();
      await page.mouse.up();
      await expect(input).toBeChecked();
      await expect(indicator).toHaveCSS('background-color', colors.accent);

      // Keyboard activation changes values for toggles; a radio stays selected.
      await input.press('Space');
      await expect(input).toHaveJSProperty('checked', role === 'radio');
      await expect(row).toHaveCSS('outline-width', '2px');
      if (role !== 'radio') await input.press('Space');
      await expect(input).toBeChecked();
      if (role === 'checkbox') {
        await expect(indicator.locator('.mm-icon')).toHaveCSS(
          'visibility',
          'visible',
        );
        await expect(indicator.locator('.mm-icon')).toHaveCSS('width', '18px');
      } else {
        const marker = await indicator.evaluate((element) => {
          const style = getComputedStyle(element, '::after');
          return {
            width: style.width,
            left: style.left,
            visibility: style.visibility,
          };
        });
        expect(marker.width).toBe(role === 'switch' ? '20px' : '10px');
        expect(marker.visibility).toBe('visible');
        if (role === 'switch') expect(marker.left).toBe('21px');
      }
      for (const checked of [false, true]) {
        const disabled = region.getByRole(role, {
          name: checked ? 'Недоступно, включено' : 'Недоступно, выключено',
        });
        const disabledRow = disabled.locator('..');
        await expect(disabled).toBeDisabled();
        await disabledRow.hover();
        await expect(disabledRow).toHaveCSS(
          'background-color',
          'rgba(0, 0, 0, 0)',
        );
        // Use a real pointer click: locator.click waits for disabled controls to enable.
        const bounds = await disabledRow.boundingBox();
        await page.mouse.click(
          bounds!.x + bounds!.width / 2,
          bounds!.y + bounds!.height / 2,
        );
        await expect(disabled).toHaveJSProperty('checked', checked);
        await expect(disabledRow.locator('.mm-selection-indicator')).toHaveCSS(
          'background-color',
          checked ? colors.muted : colors.line,
        );
      }
    }

    const group = page.getByRole('group', { name: 'Кто видит планы' });
    const friends = group.getByRole('radio', { name: 'Только друзья' });
    const privateOption = group.getByRole('radio', { name: 'Только я' });
    await friends.focus();
    await friends.press('ArrowDown');
    await expect(privateOption).toBeFocused();
    await expect(privateOption).toBeChecked();
    await expect(friends).not.toBeChecked();
    await privateOption.press('ArrowDown');
    await expect(friends).toBeFocused();
    await expect(friends).toBeChecked();
    await expect(privateOption).not.toBeChecked();
    await page.screenshot({
      path: testInfo.outputPath('selection-interaction.png'),
      fullPage: true,
    });
  });
}

test('disabled rows are skipped and 200% text wraps on a narrow screen', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/iframe.html?id=selection--light&viewMode=story');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '32px';
  });
  const checkboxRegion = page.getByRole('region', { name: 'checkbox' });
  const selected = checkboxRegion.getByRole('checkbox', {
    name: 'Включено',
    exact: true,
  });
  await selected.focus();
  await selected.press('Tab');
  await expect(
    checkboxRegion.getByRole('checkbox', { name: /Получать напоминания/ }),
  ).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    320,
  );
  const longRow = checkboxRegion
    .getByRole('checkbox', { name: /Получать напоминания/ })
    .locator('..');
  expect((await longRow.boundingBox())!.height).toBeGreaterThan(48);
});

test.describe('touch input', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  test('the full label toggles without a sticky hover background', async ({
    page,
  }) => {
    await page.goto('/iframe.html?id=selection--dark&viewMode=story');
    const checkbox = page
      .getByRole('region', { name: 'checkbox' })
      .getByRole('checkbox', { name: 'Выключено', exact: true });
    const row = checkbox.locator('..');
    await row.tap({ position: { x: 150, y: 24 } });
    await expect(checkbox).toBeChecked();
    await expect(row).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await row.tap({ position: { x: 150, y: 24 } });
    await expect(checkbox).not.toBeChecked();
  });
});

test('high contrast exposes native indicators and keyboard state', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/iframe.html?id=selection--dark&viewMode=story');
  for (const role of ['checkbox', 'radio', 'switch'] as const) {
    const input = page
      .getByRole('region', { name: role })
      .getByRole(role, { name: 'Выключено', exact: true });
    await expect(input).toHaveCSS('opacity', '1');
    await expect(
      input.locator('..').locator('.mm-selection-indicator'),
    ).toHaveCSS('opacity', '0');
    await input.press('Space');
    await expect(input).toBeChecked();
    await expect(input.locator('..')).toHaveCSS('outline-width', '2px');
  }
});
