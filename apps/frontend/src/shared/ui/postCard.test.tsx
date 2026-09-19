import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PostCard } from './postCard';

const common = {
  author: 'Анна Кузнецова',
  publishedLabel: 'Сегодня, 12:40',
  audience: 'Для друзей',
  body: 'Нашли новый маршрут у реки.',
  reactionCount: 12,
} as const;

describe('PostCard', () => {
  it('emits a reaction without changing the controlled count or state', () => {
    const onReaction = vi.fn();
    render(
      <PostCard
        {...common}
        liked={false}
        onReaction={onReaction}
        className="custom"
      />,
    );
    const card = screen.getByRole('article', { name: common.author });
    const reaction = screen.getByRole('button', { name: 'Нравится · 12' });
    expect(card).toHaveClass('custom');
    expect(card).toHaveAttribute('data-liked', 'false');
    expect(reaction).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(reaction);
    expect(onReaction).toHaveBeenCalledOnce();
    expect(reaction).toHaveTextContent('Нравится · 12');
  });

  it('renders confirmed liked state and preserves error context', () => {
    render(
      <PostCard
        {...common}
        liked
        reactionCount={13}
        error="Не удалось изменить реакцию."
        statusMessage="Можно повторить"
        onReaction={vi.fn()}
      />,
    );
    const reaction = screen.getByRole('button', { name: 'Нравится · 13' });
    expect(reaction).toHaveAttribute('aria-pressed', 'true');
    expect(reaction).toHaveAccessibleDescription(
      'Не удалось изменить реакцию.',
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Не удалось');
    expect(screen.getByRole('status')).toHaveTextContent('Можно повторить');
  });

  it('locks reaction during loading and announces progress', () => {
    render(<PostCard {...common} liked={false} loading onReaction={vi.fn()} />);
    expect(
      screen.getByRole('button', { name: 'Изменяем реакцию…' }),
    ).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Изменяем реакцию…');
  });

  it('disables reaction without an owner and keeps empty error silent', () => {
    render(<PostCard {...common} liked={false} />);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('alert')).toBeEmptyDOMElement();
  });
});
