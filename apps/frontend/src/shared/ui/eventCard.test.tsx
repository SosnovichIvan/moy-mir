import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EventCard } from './eventCard';

const common = {
  dateTime: '2026-09-19T18:30:00+03:00',
  dateLabel: '19 сентября · 18:30',
  timeZoneLabel: 'МСК',
  title: 'Прогулка у воды',
  details: 'Набережная · 4 участника',
} as const;

describe('EventCard', () => {
  it('emits invitation acceptance and associates a recoverable error', () => {
    const onAccept = vi.fn();
    render(
      <EventCard
        {...common}
        state="invited"
        error="Не удалось принять приглашение."
        statusMessage="Можно повторить"
        onAccept={onAccept}
        className="custom"
      />,
    );
    const card = screen.getByRole('article', { name: common.title });
    const button = screen.getByRole('button', {
      name: 'Принять приглашение',
    });
    expect(card).toHaveClass('custom');
    expect(screen.getByText('Вас пригласили')).toBeVisible();
    expect(
      screen.getByText(common.dateLabel, { exact: false }),
    ).toHaveAttribute('datetime', common.dateTime);
    expect(button).toHaveAccessibleDescription(
      'Не удалось принять приглашение.',
    );
    fireEvent.click(button);
    expect(onAccept).toHaveBeenCalledOnce();
    expect(card).toHaveAttribute('data-state', 'invited');
    expect(screen.getByRole('alert')).toHaveTextContent('Не удалось');
    expect(screen.getByRole('status')).toHaveTextContent('Можно повторить');
  });

  it('locks an invitation while loading and announces progress', () => {
    render(
      <EventCard {...common} state="invited" loading onAccept={vi.fn()} />,
    );
    expect(
      screen.getByRole('button', { name: 'Принимаем приглашение…' }),
    ).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Принимаем приглашение…',
    );
  });

  it('disables invitation acceptance without an owner callback', () => {
    render(<EventCard {...common} state="invited" />);
    expect(
      screen.getByRole('button', { name: 'Принять приглашение' }),
    ).toBeDisabled();
    expect(screen.getByRole('alert')).toBeEmptyDOMElement();
  });

  it('renders joined as a native link with caller bindings', () => {
    const onClick = vi.fn((event) => event.preventDefault());
    render(
      <EventCard
        {...common}
        state="joined"
        href="/events/1"
        linkProps={{ className: 'custom-link', target: '_blank', onClick }}
      />,
    );
    const link = screen.getByRole('link', { name: 'Открыть событие' });
    expect(link).toHaveAttribute('href', '/events/1');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveClass('custom-link');
    fireEvent.click(link);
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByText('Вы участвуете')).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders cancelled without an action and duplicates danger in text', () => {
    render(<EventCard {...common} state="cancelled" />);
    expect(screen.getByText('Событие отменено')).toHaveAttribute(
      'data-danger',
      'true',
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
