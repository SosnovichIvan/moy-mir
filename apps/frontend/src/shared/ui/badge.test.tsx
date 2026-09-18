import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge, CountBadge } from './badge';

describe('Badge', () => {
  it('renders a static label without extra live announcements or actions', () => {
    const { container } = render(<Badge label="Участник" />);
    expect(screen.getByText('Участник').parentElement).toHaveAttribute(
      'data-tone',
      'neutral',
    );
    expect(
      container.querySelector('[tabindex],button,[aria-live],[role="status"]'),
    ).toBeNull();
    expect(container.querySelector('.mm-icon')).toBeNull();
  });
  it.each(['neutral', 'pending', 'success', 'error'] as const)(
    'supports %s and both decorative icon slots',
    (tone) => {
      const { container } = render(
        <Badge
          label="Полный текст"
          tone={tone}
          leadingIcon="user"
          trailingIcon="close"
          className="custom"
        />,
      );
      expect(container.firstChild).toHaveClass('custom');
      expect(container.firstChild).toHaveAttribute('data-tone', tone);
      expect(
        container.querySelectorAll('.mm-icon[aria-hidden="true"]'),
      ).toHaveLength(2);
      expect(screen.getByText('Полный текст')).toBeVisible();
    },
  );
  it.each([0, 3, 9, 10, 99, 100, 1234, Number.MAX_SAFE_INTEGER])(
    'preserves the full accessible count %s',
    (count) => {
      const { container } = render(
        <CountBadge
          count={count}
          label="Непрочитанные сообщения"
          className="counter"
        />,
      );
      expect(screen.getByText(`Непрочитанные сообщения: ${count}`)).toHaveClass(
        'sr-only',
      );
      expect(container.firstChild).toHaveClass('counter');
      expect(container.firstChild).toHaveAttribute(
        'data-wide',
        String(count > 9),
      );
      expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent(
        count > 99 ? '99+' : String(count),
      );
    },
  );
  it('works without custom class and updates count without focus or live region', () => {
    const { container, rerender } = render(
      <CountBadge count={9} label="Заявки" />,
    );
    rerender(<CountBadge count={123} label="Заявки" />);
    expect(screen.getByText('Заявки: 123')).toBeInTheDocument();
    expect(container.querySelector('[aria-live],[tabindex]')).toBeNull();
  });
  it.each([-1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
    'rejects invalid count %s',
    (count) => {
      expect(() => render(<CountBadge count={count} label="Заявки" />)).toThrow(
        RangeError,
      );
    },
  );
});
