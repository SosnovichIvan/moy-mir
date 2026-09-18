import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './app';
import { MemoryRouter } from 'react-router';

describe('App', () => {
  it('provides a main landmark and the product name as the page heading', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    expect(
      within(screen.getByRole('main')).getByRole('heading', {
        level: 1,
        name: 'Мой МИР',
      }),
    ).toBeVisible();
  });

  it.each([
    ['/about/project', 'О проекте'],
    ['/unknown/path', 'Страница не найдена'],
  ])('renders direct route %s', (path, heading) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('heading', { level: 1, name: heading }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'На главную' })).toHaveAttribute(
      'href',
      '/',
    );
  });
});
