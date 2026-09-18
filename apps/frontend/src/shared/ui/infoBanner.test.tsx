import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { InfoBanner } from './infoBanner';

it('shows static content and a caller action without announcing it', () => {
  const { container } = render(
    <InfoBanner
      title="Нет друзей"
      body="Найдите знакомых"
      state="empty"
      action={<button>Найти</button>}
    />,
  );
  expect(screen.getByRole('heading', { name: 'Нет друзей' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Найти' })).toBeVisible();
  expect(container.querySelector('[aria-live="off"]')).toBeEmptyDOMElement();
  expect(container.querySelector('section')).toHaveAttribute('data-size', 's');
});
it('keeps the announcement region mounted and updates its full message', () => {
  const { container, rerender } = render(
    <InfoBanner
      title="Загрузка"
      body="Подождите"
      state="loading"
      announcement="polite"
      size="m"
      className="custom"
      action={<button>Повторить</button>}
    />,
  );
  const region = container.querySelector('[aria-live]');
  expect(region).toHaveTextContent('Загрузка. Подождите');
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  rerender(
    <InfoBanner
      title="Ошибка"
      body="Повторите попытку"
      state="error"
      announcement="assertive"
      size="l"
    />,
  );
  expect(region).toBe(container.querySelector('[aria-live]'));
  expect(region).toHaveAttribute('aria-live', 'assertive');
  expect(region).toHaveTextContent('Ошибка. Повторите попытку');
});
