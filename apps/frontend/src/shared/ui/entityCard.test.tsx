import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EntityCard } from './entityCard';
import type { EntityCardConfiguration } from './generated/entityCard';

describe('EntityCard', () => {
  it('does not reclaim focus after an explicit blur to the page background', () => {
    const onAction = vi.fn();
    const { rerender } = render(
      <EntityCard name="Анна" state="new" onAction={onAction} />,
    );
    act(() => {
      screen.getByRole('button').focus();
      screen.getByRole('button').blur();
    });
    rerender(<EntityCard name="Анна" state="pending" onAction={onAction} />);
    expect(document.body).toHaveFocus();
  });
  it('keeps a retained link focused when its state changes', () => {
    const { rerender } = render(
      <EntityCard name="Анна" state="friend" href="/anna" />,
    );
    act(() => screen.getByRole('link').focus());
    rerender(<EntityCard name="Анна" state="member" href="/group" />);
    expect(screen.getByRole('link', { name: 'Открыть группу' })).toHaveFocus();
  });
  it.each([
    ['new', 'Добавить в друзья', 'add'],
    ['pending', 'Отменить заявку', 'cancel'],
    ['incoming', 'Принять', 'accept'],
    ['incoming', 'Отклонить', 'decline'],
    ['blocked', 'Разблокировать', 'unblock'],
  ] as const)(
    'emits %s / %s without changing owner state',
    (state, label, action) => {
      const onAction = vi.fn();
      render(
        <EntityCard name="Анна Кузнецова" state={state} onAction={onAction} />,
      );
      const card = screen.getByRole('article', { name: 'Анна Кузнецова' });
      fireEvent.click(within(card).getByRole('button', { name: label }));
      expect(onAction).toHaveBeenCalledExactlyOnceWith(action);
      expect(card).toHaveAttribute('data-state', state);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    },
  );

  it.each(['friend', 'member'] as const)(
    'renders a native %s link with caller bindings',
    (state) => {
      const onClick = vi.fn((event) => event.preventDefault());
      render(
        <EntityCard
          name="Бегаем вместе"
          state={state}
          href="/destination"
          className="custom"
          linkProps={{ onClick, target: '_blank', className: 'custom-link' }}
        />,
      );
      const link = screen.getByRole('link', {
        name: state === 'friend' ? 'Открыть профиль' : 'Открыть группу',
      });
      expect(link).toHaveAttribute('href', '/destination');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveClass('custom-link');
      expect(screen.getByRole('article')).toHaveClass('custom');
      expect(screen.getByText('БВ')).toBeInTheDocument();
      fireEvent.click(link);
      expect(onClick).toHaveBeenCalledOnce();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    },
  );

  it('keeps names as text, details optional and image failures in Avatar', () => {
    const { rerender } = render(
      <EntityCard
        name="<script>alert(1)</script>"
        state="friend"
        href="/profile"
        avatarSrc="/photo.png"
        detail="У вас в друзьях"
      />,
    );
    expect(screen.getByRole('heading')).toHaveTextContent(
      '<script>alert(1)</script>',
    );
    expect(document.querySelector('script')).toBeNull();
    expect(screen.getByText('У вас в друзьях')).toBeVisible();
    const img = document.querySelector('img')!;
    expect(img).toHaveAttribute('src', '/photo.png');
    fireEvent.error(img);
    expect(document.querySelector('img')).toBeNull();
    rerender(<EntityCard name="Анна" state="friend" href="/profile" />);
    expect(screen.queryByText('У вас в друзьях')).toBeNull();
  });

  it('disables actions when no owner handler is supplied', () => {
    render(<EntityCard name="Анна" state="incoming" />);
    for (const button of screen.getAllByRole('button'))
      expect(button).toBeDisabled();
  });

  it('locks both incoming actions, preserves accessible labels and restores retry focus', () => {
    const onAction = vi.fn();
    const { rerender } = render(
      <EntityCard name="Анна" state="incoming" onAction={onAction} />,
    );
    const decline = screen.getByRole('button', { name: 'Отклонить' });
    act(() => decline.focus());
    rerender(
      <EntityCard
        name="Анна"
        state="incoming"
        loadingAction="decline"
        onAction={onAction}
      />,
    );
    expect(screen.getByRole('article')).toHaveFocus();
    expect(decline).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Принять' })).toHaveAttribute(
      'aria-busy',
      'false',
    );
    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled();
      fireEvent.click(button);
    }
    expect(onAction).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Выполняется: Отклонить',
    );
    rerender(
      <EntityCard
        name="Анна"
        state="incoming"
        error="Не удалось отклонить заявку. Попробуйте ещё раз."
        onAction={onAction}
      />,
    );
    expect(decline).toHaveFocus();
    expect(decline).toHaveAccessibleDescription(
      'Не удалось отклонить заявку. Попробуйте ещё раз.',
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Не удалось отклонить заявку',
    );
    fireEvent.click(decline);
    expect(onAction).toHaveBeenCalledExactlyOnceWith('decline');
  });

  it('moves focus to a replacement action after owner-confirmed success', () => {
    const onAction = vi.fn();
    const { rerender } = render(
      <EntityCard name="Анна" state="new" onAction={onAction} />,
    );
    act(() => screen.getByRole('button').focus());
    rerender(
      <EntityCard
        name="Анна"
        state="pending"
        onAction={onAction}
        statusMessage="Заявка отправлена"
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Отменить заявку' }),
    ).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('Заявка отправлена');
    rerender(<EntityCard name="Анна" state="friend" href="/anna" />);
    expect(screen.getByRole('link')).toHaveFocus();
  });

  it('uses the card as a focus fallback if the next state has no enabled action', () => {
    const { rerender } = render(
      <EntityCard name="Анна" state="new" onAction={vi.fn()} />,
    );
    act(() => screen.getByRole('button').focus());
    rerender(<EntityCard name="Анна" state="blocked" />);
    expect(screen.getByRole('article')).toHaveFocus();
  });

  it('does not steal focus after the user moves outside during loading', () => {
    const onAction = vi.fn();
    const view = (loading: boolean) => (
      <>
        <button>Другая карточка</button>
        <EntityCard
          name="Анна"
          state="new"
          {...(loading ? { loadingAction: 'add' as const } : {})}
          onAction={onAction}
        />
      </>
    );
    const { rerender } = render(view(false));
    act(() =>
      screen.getByRole('button', { name: 'Добавить в друзья' }).focus(),
    );
    rerender(view(true));
    act(() => screen.getByRole('button', { name: 'Другая карточка' }).focus());
    rerender(view(false));
    expect(
      screen.getByRole('button', { name: 'Другая карточка' }),
    ).toHaveFocus();
  });

  it('does not move focus on passive state updates or when focus is elsewhere', () => {
    const { rerender } = render(
      <>
        <input aria-label="Поиск" />
        <EntityCard name="Анна" state="new" onAction={vi.fn()} />
      </>,
    );
    act(() => screen.getByRole('textbox').focus());
    rerender(
      <>
        <input aria-label="Поиск" />
        <EntityCard name="Анна" state="pending" onAction={vi.fn()} />
      </>,
    );
    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('creates unique title/error associations for repeated names', () => {
    render(
      <>
        <EntityCard name="Анна" state="new" error="Ошибка 1" />
        <EntityCard name="Анна" state="new" error="Ошибка 2" />
      </>,
    );
    const cards = screen.getAllByRole('article', { name: 'Анна' });
    expect(cards[0]!.getAttribute('aria-labelledby')).not.toBe(
      cards[1]!.getAttribute('aria-labelledby'),
    );
    expect(within(cards[0]!).getByRole('button')).toHaveAccessibleDescription(
      'Ошибка 1',
    );
    expect(within(cards[1]!).getByRole('button')).toHaveAccessibleDescription(
      'Ошибка 2',
    );
  });
});

// Compile-time contract regressions: links require destinations, loading matches the state.
// @ts-expect-error A friend card needs an href.
const missingHref: EntityCardConfiguration = { name: 'Анна', state: 'friend' };
// @ts-expect-error An outgoing request cannot be accepted.
const wrongAction: EntityCardConfiguration = {
  name: 'Анна',
  state: 'pending',
  loadingAction: 'accept',
};
void missingHref;
void wrongAction;
