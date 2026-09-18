import { expect, test } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  for (const width of [320, 390, 768, 1440]) {
    test(`${theme} EntityCard fits ${width}px and text 200%`, async ({
      page,
    }, info) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/iframe.html?id=entity-card--${theme}&viewMode=story`);
      const region = page.getByRole('region', {
        name: 'Все состояния',
        exact: true,
      });
      await expect(region.getByRole('article')).toHaveCount(6);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      const card = region.getByRole('article').first();
      const content = card.locator('.mm-entity-card-content');
      await expect(content).toHaveCSS(
        'flex-direction',
        width < 768 ? 'column' : 'row',
      );
      await expect(
        page
          .getByRole('region', { name: 'Узкий контейнер' })
          .locator('.mm-entity-card-content'),
      ).toHaveCSS('flex-direction', 'column');
      for (const button of await region.getByRole('button').all()) {
        const box = (await button.boundingBox())!;
        expect(box.height).toBe(48);
        expect(box.width).toBeGreaterThanOrEqual(96);
        expect(box.width).toBeLessThan((await card.boundingBox())!.width - 32);
      }
      await expect(
        page.getByRole('article', { name: 'Мария Котова' }).locator('img'),
      ).toHaveAttribute('data-loaded', 'true');
      await expect(
        page.getByRole('article', { name: 'Иван Петров' }).locator('img'),
      ).toHaveCount(0);
      await page.screenshot({
        path: info.outputPath('entity-card.png'),
        fullPage: true,
      });
      await page
        .getByRole('checkbox', { name: 'Длинные имена и описания' })
        .check();
      await page.evaluate(() => {
        document.documentElement.style.fontSize = '200%';
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      for (const node of await page
        .locator(
          '.mm-entity-card, .mm-entity-card-title, .mm-entity-card-detail, .mm-button-label',
        )
        .all()) {
        expect(
          await node.evaluate(
            (n) =>
              n.scrollWidth <= n.clientWidth + 1 &&
              n.scrollHeight <= n.clientHeight + 1,
          ),
        ).toBe(true);
      }
      if (width < 768) {
        const identity = card.locator('.mm-entity-card-identity');
        const avatar = (await identity.locator('.mm-avatar').boundingBox())!;
        const title = (await identity.locator('h3').boundingBox())!;
        expect(title.y).toBeGreaterThanOrEqual(avatar.y + avatar.height);
      }
      await page.screenshot({
        path: info.outputPath('entity-card-200.png'),
        fullPage: true,
      });
      expect(errors).toEqual([]);
    });
  }

  for (const [state, action, result] of [
    ['new', 'Добавить в друзья', 'pending'],
    ['pending', 'Отменить заявку', 'new'],
    ['incoming', 'Принять', 'friend'],
    ['incoming', 'Отклонить', 'new'],
    ['blocked', 'Разблокировать', 'new'],
  ] as const) {
    test(`${theme} ${action}: loading, error, retry and success`, async ({
      page,
    }) => {
      await page.goto(`/iframe.html?id=entity-card--${theme}&viewMode=story`);
      const scenario = page.getByRole('region', {
        name: `Сценарий ${state}`,
        exact: true,
      });
      const card = scenario.getByRole('article');
      await scenario.getByRole('checkbox').check();
      const button = card.getByRole('button', { name: action, exact: true });
      await button.focus();
      const before = (await button.boundingBox())!;
      await page.keyboard.press('Enter');
      await expect(button).toHaveAttribute('aria-busy', 'true');
      await expect(button.locator('.mm-button-loading')).toBeVisible();
      await expect(card).toBeFocused();
      const during = (await button.boundingBox())!;
      expect(during.width).toBe(before.width);
      expect(during.height).toBe(before.height);
      for (const control of await card.getByRole('button').all())
        await expect(control).toBeDisabled();
      await expect(card.getByRole('alert')).toContainText('Не удалось');
      await expect(card).toHaveAttribute('data-state', state!);
      await expect(button).toBeFocused();
      await scenario.getByRole('checkbox').uncheck();
      await button.focus();
      await page.keyboard.press('Space');
      await expect(card).toHaveAttribute('data-state', result!);
      await expect(card.getByRole('alert')).toBeEmpty();
      await expect(card.getByRole('status')).not.toBeEmpty();
      await expect(card.locator('button, a')).toBeFocused();
    });
  }
}

test('EntityCard respects outside focus and native link navigation', async ({
  page,
  context,
}) => {
  await page.goto('/iframe.html?id=entity-card--light&viewMode=story');
  const scenario = page.getByRole('region', {
    name: 'Сценарий new',
    exact: true,
  });
  await scenario.getByRole('article').getByRole('button').click();
  const outside = page.getByRole('checkbox', {
    name: 'Длинные имена и описания',
  });
  await outside.focus();
  await expect(scenario.getByRole('article')).toHaveAttribute(
    'data-state',
    'pending',
  );
  await expect(outside).toBeFocused();
  const group = page
    .getByRole('region', { name: 'Все состояния', exact: true })
    .getByRole('link', { name: 'Открыть группу' });
  await page.keyboard.press('Tab');
  await group.focus();
  await expect(group).toHaveCSS('outline-style', 'solid');
  const opened = context.waitForEvent('page');
  await group.click({ modifiers: ['ControlOrMeta'] });
  const tab = await opened;
  await tab.waitForLoadState();
  await expect(tab).toHaveURL(/#group$/);
  await tab.close();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#group$/);
});

test('EntityCard supports touch and reduced motion', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto(
    'http://127.0.0.1:6006/iframe.html?id=entity-card--dark&viewMode=story',
  );
  const card = page
    .getByRole('region', { name: 'Сценарий incoming', exact: true })
    .getByRole('article');
  await card.getByRole('button', { name: 'Принять' }).tap();
  await expect(card.locator('.mm-button-loading')).toHaveCSS(
    'animation-name',
    'none',
  );
  await expect(card).toHaveAttribute('data-state', 'friend');
  await context.close();
});

test('EntityCard links and focus remain visible in forced colors', async ({
  page,
}, info) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/iframe.html?id=entity-card--dark&viewMode=story');
  const link = page
    .getByRole('region', { name: 'Все состояния', exact: true })
    .getByRole('link', { name: 'Открыть профиль' });
  await link.focus();
  await expect(link).toHaveCSS('border-top-style', 'solid');
  await expect(link).toHaveCSS('outline-style', 'solid');
  await page.screenshot({
    path: info.outputPath('entity-card-forced-colors.png'),
  });
});
