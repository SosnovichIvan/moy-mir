import { expect, test } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  for (const width of [320, 390, 768, 1440]) {
    test(`${theme} avatar and badge fit ${width}px`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/iframe.html?id=avatar--${theme}&viewMode=story`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        'Avatar',
      );
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await page.evaluate(() => document.fonts.ready);
      for (const size of [32, 48, 64]) {
        for (const avatar of await page
          .locator(`.mm-avatar[data-size="${size}"]`)
          .all()) {
          await expect(avatar).toHaveCSS('width', `${size}px`);
          await expect(avatar).toHaveCSS('height', `${size}px`);
        }
      }
      const images = page
        .getByRole('region', { name: 'Изображение', exact: true })
        .locator('img');
      for (const img of await images.all()) {
        await expect(img).toHaveAttribute('data-loaded', 'true');
        await expect(img).toHaveCSS('object-fit', 'cover');
        expect(
          await img.evaluate((e: HTMLImageElement) => e.naturalWidth),
        ).toBe(240);
      }
      await expect(
        page
          .getByRole('region', { name: 'Ошибка', exact: true })
          .locator('img'),
      ).toHaveCount(0);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBe(width);
      await page.screenshot({
        path: testInfo.outputPath('avatar.png'),
        fullPage: true,
      });
      await page.goto(`/iframe.html?id=badge--${theme}&viewMode=story`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Badge');
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await page.evaluate(() => document.fonts.ready);
      const counts = page.getByRole('region', {
        name: 'Счётчики',
        exact: true,
      });
      for (const badge of await counts.locator('[data-wide="false"]').all()) {
        await expect(badge).toHaveCSS('width', '24px');
        await expect(badge).toHaveCSS('height', '24px');
      }
      await expect(
        counts.getByText('Непрочитанные сообщения: 1234'),
      ).toBeAttached();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBe(width);
      for (const icon of await page.locator('.mm-badge > .mm-icon').all()) {
        await expect(icon).toHaveCSS('width', '16px');
        const center = await icon.evaluate((e) => {
          const i = e.getBoundingClientRect(),
            p = e.parentElement!.getBoundingClientRect();
          return Math.abs(i.y + i.height / 2 - p.y - p.height / 2);
        });
        expect(center).toBeLessThan(1);
      }
      await page.screenshot({
        path: testInfo.outputPath('badge.png'),
        fullPage: true,
      });
    });
  }
  test(`${theme} image loading, failure and URL replacement`, async ({
    page,
  }) => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route('**/avatar-demo*.png?replacement', async (route) => {
      await gate;
      await route.continue();
    });
    await page.goto(`/iframe.html?id=avatar--${theme}&viewMode=story`);
    const section = page.getByRole('region', { name: 'Смена изображения' });
    const avatar = section.getByRole('img', { name: 'Мария Котова' });
    await section
      .getByRole('button', { name: 'Загрузить изображение' })
      .click();
    await expect(avatar).toHaveText('МК');
    await expect(avatar.locator('img')).toHaveAttribute('data-loaded', 'false');
    await section.getByRole('button', { name: 'Проверить ошибку' }).click();
    await expect(avatar.locator('img')).toHaveCount(0);
    release();
    await expect(avatar).toHaveText('МК');
    await section
      .getByRole('button', { name: 'Загрузить изображение' })
      .click();
    await expect(avatar.locator('img')).toHaveAttribute('data-loaded', 'true');
    await expect(avatar.locator('.mm-avatar-fallback')).toHaveCount(0);
    await section.getByRole('button', { name: 'Убрать изображение' }).click();
    await expect(avatar).toHaveText('МК');
    await expect(avatar.locator('img')).toHaveCount(0);
  });
}

test('200% text, keyboard and full status announcement', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/iframe.html?id=badge--light&viewMode=story');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  const section = page.getByRole('region', { name: 'Длинная подпись' });
  for (const label of await section.locator('.mm-badge-label').all()) {
    expect(await label.evaluate((e) => e.scrollWidth <= e.clientWidth)).toBe(
      true,
    );
    expect(await label.evaluate((e) => e.scrollHeight <= e.clientHeight)).toBe(
      true,
    );
  }
  const count = page.getByRole('region', { name: 'Изменить счётчик' });
  await page.keyboard.press('Tab');
  await expect(count.getByRole('button')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(count.getByRole('status')).toHaveText('Заявки: 100');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    320,
  );
  await page.screenshot({
    path: testInfo.outputPath('badge-zoom.png'),
    fullPage: true,
  });
});

test('forced colors retain component boundaries', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/iframe.html?id=badge--dark&viewMode=story');
  await expect(page.locator('.mm-badge').first()).toHaveCSS(
    'outline-style',
    'solid',
  );
  await expect(page.locator('.mm-count-badge').first()).toHaveCSS(
    'outline-style',
    'solid',
  );
  await page.goto('/iframe.html?id=avatar--dark&viewMode=story');
  await expect(page.locator('.mm-avatar').first()).toHaveCSS(
    'outline-style',
    'solid',
  );
});

test('avatar initials remain inside stable circles at 200% text', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/iframe.html?id=avatar--light&viewMode=story');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  for (const fallback of await page.locator('.mm-avatar-fallback').all()) {
    expect(
      await fallback.evaluate(
        (e) =>
          e.getBoundingClientRect().width <=
          e.parentElement!.getBoundingClientRect().width,
      ),
    ).toBe(true);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    320,
  );
});
