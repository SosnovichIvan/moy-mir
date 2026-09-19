import { expect, test } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  for (const width of [320, 390, 768, 1440]) {
    test(`${theme} FE-20 components fit ${width}px`, async ({ page }, info) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/iframe.html?id=content-cards--${theme}&viewMode=story`);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect(
        page
          .getByRole('region', { name: 'Message · все состояния' })
          .getByRole('article'),
      ).toHaveCount(4);
      await expect(
        page
          .getByRole('region', { name: 'EventCard · все состояния' })
          .getByRole('article'),
      ).toHaveCount(3);
      await expect(
        page
          .getByRole('region', { name: 'WorkoutEntry · узкий контейнер' })
          .getByRole('article'),
      ).toHaveCount(3);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);

      const messageRegion = page.getByRole('region', {
        name: 'Message · все состояния',
      });
      const incoming = messageRegion.getByRole('article').first();
      const outgoing = messageRegion.getByRole('article').nth(1);
      const regionBox = (await messageRegion.boundingBox())!;
      const incomingBox = (await incoming.boundingBox())!;
      const outgoingBox = (await outgoing.boundingBox())!;
      expect(incomingBox.width).toBeLessThanOrEqual(regionBox.width * 0.85 + 1);
      expect(outgoingBox.x + outgoingBox.width).toBeCloseTo(
        regionBox.x + regionBox.width,
        0,
      );

      for (const button of await page
        .locator('.mm-event-card, .mm-post-card, .mm-workout-entry')
        .getByRole('button')
        .all()) {
        const box = (await button.boundingBox())!;
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.width).toBeLessThan(
          (await button.locator('xpath=ancestor::article[1]').boundingBox())!
            .width,
        );
      }

      const wideWorkout = page
        .getByRole('region', { name: 'WorkoutEntry · широкий контейнер' })
        .locator('.mm-workout-entry-content')
        .first();
      const columns = await wideWorkout.evaluate(
        (node) => getComputedStyle(node).gridTemplateColumns.split(' ').length,
      );
      expect(columns).toBe(width >= 1024 ? 5 : 1);

      await page.screenshot({
        path: info.outputPath('content-cards.png'),
        fullPage: true,
      });
      expect(errors).toEqual([]);
    });
  }
}

test('FE-20 owner controls event and reaction state', async ({ page }) => {
  await page.goto('/iframe.html?id=content-cards--light&viewMode=story');
  const events = page.getByRole('region', {
    name: 'EventCard · все состояния',
  });
  const invitation = events.getByRole('article').first();
  await invitation.getByRole('button', { name: 'Принять приглашение' }).click();
  await expect(invitation).toHaveAttribute('data-state', 'joined');
  await expect(
    invitation.getByRole('link', { name: 'Открыть событие' }),
  ).toBeVisible();

  const posts = page.getByRole('region', { name: 'PostCard · состояния' });
  const reaction = posts.getByRole('button', { name: 'Нравится · 12' });
  await reaction.click();
  await expect(
    posts.getByRole('button', { name: 'Нравится · 13' }),
  ).toHaveAttribute('aria-pressed', 'true');
});

test('FE-20 loading, errors, keyboard focus and reduced motion remain visible', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/iframe.html?id=content-cards--dark&viewMode=story');
  const loading = page.getByRole('region', { name: 'Загрузка и ошибки' });
  const eventButton = loading.getByRole('button', {
    name: 'Принимаем приглашение…',
  });
  await expect(eventButton).toBeDisabled();
  await expect(eventButton.locator('.mm-button-loading')).toHaveCSS(
    'animation-name',
    'none',
  );
  await loading.getByRole('checkbox').check();
  const invitation = page
    .getByRole('region', { name: 'EventCard · все состояния' })
    .getByRole('article')
    .first();
  await expect(invitation.getByRole('alert')).toContainText('Не удалось');
  const retry = invitation.getByRole('button');
  await retry.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(retry).toBeFocused();
  await expect(retry).toHaveCSS('outline-style', 'solid');
});

test('FE-20 long content survives 200 percent text without page overflow', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/iframe.html?id=content-cards--light&viewMode=story');
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  const region = page.getByRole('region', { name: 'Длинный контент' });
  await expect(region.getByRole('article')).toHaveCount(3);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  for (const node of await region.locator('article, article *').all()) {
    expect(
      await node.evaluate(
        (element) =>
          element.scrollWidth <= element.clientWidth + 1 &&
          element.scrollHeight <= element.clientHeight + 1,
      ),
    ).toBe(true);
  }
  await page.screenshot({
    path: info.outputPath('content-cards-200.png'),
    fullPage: true,
  });
});

test('FE-20 native links retain boundaries and keyboard focus in forced colors', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/iframe.html?id=content-cards--dark&viewMode=story');
  const link = page
    .getByRole('region', { name: 'EventCard · все состояния' })
    .getByRole('link', { name: 'Открыть событие' })
    .first();
  await link.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(link).toBeFocused();
  await expect(link).toHaveCSS('border-top-style', 'solid');
  await expect(link).toHaveCSS('outline-style', 'solid');
});
