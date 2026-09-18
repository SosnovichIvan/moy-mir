import { expect, test } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  for (const width of [320, 390, 767, 768, 1023, 1024, 1440]) {
    test(`${theme} Navigation at ${width}`, async ({ page }, info) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/iframe.html?id=navigation--${theme}&viewMode=story`);
      const nav = page.getByRole('navigation', {
        name: 'Основная',
        exact: true,
      });
      await expect(nav).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      const links = nav.getByRole('link');
      await expect(links).toHaveCount(3);
      const box = (await nav.boundingBox())!;
      expect(box.height).toBe(width < 768 ? 56 : width < 1024 ? 80 : 228);
      expect(box.width).toBe(width < 1024 ? width - 32 : 240);
      await expect(nav.locator('.mm-navigation-brand')).toBeVisible({
        visible: width >= 1024,
      });
      for (const link of await links.all()) {
        const bounds = (await link.boundingBox())!;
        expect(bounds.height).toBeGreaterThanOrEqual(48);
        expect(bounds.width).toBeGreaterThanOrEqual(44);
        const icon = link.locator('.mm-icon');
        if (width < 768) {
          await expect(icon).toHaveCSS('width', '22px');
          await expect(link).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
          expect(
            await icon.evaluate((n) => getComputedStyle(n).backgroundColor),
          ).toBe(await link.evaluate((n) => getComputedStyle(n).color));
        } else await expect(icon).toBeHidden();
      }
      if (width < 768) {
        expect(
          (await page.locator('.navigation-safe-shell').boundingBox())!.height,
        ).toBe(90);
      }
      await page.screenshot({
        path: info.outputPath('navigation.png'),
        fullPage: true,
      });
      await page.getByRole('checkbox', { name: 'Длинные подписи' }).check();
      await page.evaluate(
        () => (document.documentElement.style.fontSize = '200%'),
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      for (const label of await nav.locator('.mm-navigation-label').all()) {
        expect(
          await label.evaluate(
            (n) =>
              n.scrollWidth <= n.clientWidth &&
              n.scrollHeight <= n.clientHeight,
          ),
        ).toBe(true);
      }
      expect((await nav.boundingBox())!.height).toBeGreaterThan(box.height);
      await page.screenshot({
        path: info.outputPath('navigation-zoom.png'),
        fullPage: true,
      });
    });
  }

  test(`${theme} links preserve focus, router history and new tabs`, async ({
    page,
    context,
  }, info) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto(`/iframe.html?id=navigation--${theme}&viewMode=story`);
    const nav = page.getByRole('navigation', { name: 'Основная', exact: true });
    const friends = nav.getByRole('link', { name: 'Друзья' });
    const requests = nav.getByRole('link', { name: 'Заявки' });
    const profile = nav.getByRole('link', { name: 'Профиль' });
    await friends.focus();
    await page.keyboard.press('Tab');
    await expect(requests).toBeFocused();
    await expect(requests).toHaveCSS('outline-style', 'solid');
    await expect(friends).toHaveAttribute('aria-current', 'page');
    await expect(requests).not.toHaveAttribute('aria-current');
    await page.screenshot({ path: info.outputPath('focus.png') });
    await page.keyboard.press('Enter');
    await expect(requests).toHaveAttribute('aria-current', 'page');
    await expect(page).toHaveURL(/section=requests/);
    await page.keyboard.press('Tab');
    await expect(profile).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(requests).toBeFocused();
    await page.goBack();
    await expect(friends).toHaveAttribute('aria-current', 'page');
    await page.goForward();
    await expect(requests).toHaveAttribute('aria-current', 'page');
    await page.reload();
    await expect(requests).toHaveAttribute('aria-current', 'page');
    const opened = context.waitForEvent('page');
    await profile.click({ modifiers: ['ControlOrMeta'] });
    const tab = await opened;
    await tab.waitForLoadState();
    await expect(tab).toHaveURL(/section=profile/);
    await expect(
      tab
        .getByRole('navigation', { name: 'Основная', exact: true })
        .getByRole('link', { name: 'Профиль' }),
    ).toHaveAttribute('aria-current', 'page');
    await expect(requests).toHaveAttribute('aria-current', 'page');
    await tab.close();
  });
}

test('mobile hover and pressed use color, wide uses backgrounds', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/iframe.html?id=navigation--light&viewMode=story');
  const nav = page.getByRole('navigation', { name: 'Основная', exact: true });
  const link = nav.getByRole('link', { name: 'Заявки' });
  const initial = await link.evaluate((n) => getComputedStyle(n).color);
  await link.hover();
  const hover = await link.evaluate((n) => getComputedStyle(n).color);
  expect(hover).not.toBe(initial);
  await page.mouse.down();
  expect(await link.evaluate((n) => getComputedStyle(n).color)).not.toBe(hover);
  await expect(link).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await page.mouse.up();
  await page.setViewportSize({ width: 768, height: 900 });
  await link.hover();
  expect(
    await link.evaluate((n) => getComputedStyle(n).backgroundColor),
  ).not.toBe('rgba(0, 0, 0, 0)');
});

test('touch has no sticky hover or background', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto(
    'http://127.0.0.1:6006/iframe.html?id=navigation--dark&viewMode=story',
  );
  const nav = page.getByRole('navigation', { name: 'Основная', exact: true });
  const friends = nav.getByRole('link', { name: 'Друзья' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const activeColor = await friends.evaluate((n) => getComputedStyle(n).color);
  const requests = nav.getByRole('link', { name: 'Заявки' });
  await requests.tap();
  await expect(requests).toHaveAttribute('aria-current', 'page');
  await expect(requests).toHaveCSS('color', activeColor);
  await expect(requests).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await context.close();
});

test('forced colors preserve current page and keyboard focus', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/iframe.html?id=navigation--dark&viewMode=story');
  const nav = page.getByRole('navigation', { name: 'Основная', exact: true });
  await expect(nav.locator('[aria-current] .mm-navigation-label')).toHaveCSS(
    'text-decoration-line',
    'underline',
  );
  await nav.getByRole('link', { name: 'Заявки' }).focus();
  await expect(nav.getByRole('link', { name: 'Заявки' })).toHaveCSS(
    'outline-style',
    'solid',
  );
  await page.screenshot({ path: info.outputPath('forced-colors.png') });
});
