import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Navigation, NavigationItem } from './navigation';

describe('Navigation', () => {
  it('exposes a named landmark and ordinary links, not tabs', () => {
    render(
      <Navigation label="Основная">
        <NavigationItem label="Друзья" icon="users" href="/friends" current />
        <NavigationItem label="Заявки" icon="inbox" href="/requests" />
      </Navigation>,
    );
    expect(screen.getByRole('navigation', { name: 'Основная' })).toBeVisible();
    expect(screen.getByText('мой мир')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Друзья', current: 'page' }),
    ).toHaveAttribute('href', '/friends');
    expect(screen.getByRole('link', { name: 'Заявки' })).not.toHaveAttribute(
      'aria-current',
    );
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('reflects the current page supplied by the owner and supports an empty list', () => {
    const { rerender } = render(
      <Navigation label="Разделы" brand="Свой круг" className="custom-nav">
        <NavigationItem
          label="Профиль"
          icon="user"
          href="/profile"
          current={false}
          className="custom-link"
        />
      </Navigation>,
    );
    expect(screen.getByRole('navigation')).toHaveClass('custom-nav');
    expect(screen.getByRole('link')).toHaveClass('custom-link');
    expect(screen.getByText('Свой круг')).toBeInTheDocument();
    rerender(
      <Navigation label="Разделы">
        <NavigationItem label="Профиль" icon="user" href="/profile" current />
      </Navigation>,
    );
    expect(screen.getByRole('link')).toHaveAttribute('aria-current', 'page');
    rerender(<Navigation label="Разделы">{null}</Navigation>);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('forwards native anchor bindings and leaves navigation to the browser or router', () => {
    const onClick = vi.fn();
    const ref = createRef<HTMLAnchorElement>();
    render(
      <NavigationItem
        label="Профиль"
        icon="user"
        href="/profile"
        target="_blank"
        rel="noopener"
        onClick={onClick}
        ref={ref}
      />,
    );
    const link = screen.getByRole('link');
    expect(ref.current).toBe(link);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener');
    expect(fireEvent.click(link, { ctrlKey: true })).toBe(true);
    expect(onClick).toHaveBeenCalledOnce();
    expect(onClick.mock.calls[0]![0].defaultPrevented).toBe(false);
  });
});
