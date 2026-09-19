import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Message } from './message';

describe('Message', () => {
  it('renders an incoming message as full text without a delivery suffix', () => {
    render(
      <Message
        author="Анна"
        body={'Первая строка\nВторая строка'}
        timeLabel="18:12"
        state="incoming"
        className="custom"
        data-testid="message"
      />,
    );
    const message = screen.getByTestId('message');
    expect(message).toHaveClass('custom');
    expect(message).toHaveAttribute('data-direction', 'incoming');
    expect(message).toHaveAccessibleName('Сообщение от Анна');
    expect(screen.getByText(/Первая строка/)).toHaveTextContent(
      'Первая строка Вторая строка',
    );
    expect(screen.getByText('18:12')).toBeVisible();
    expect(screen.queryByText('Отправлено')).not.toBeInTheDocument();
  });

  it.each([
    ['sent', 'Отправлено'],
    ['sending', 'Отправляем…'],
  ] as const)('renders the controlled %s state', (state, label) => {
    render(<Message body="Сообщение" timeLabel="18:12" state={state} />);
    expect(screen.getByRole('article')).toHaveAttribute(
      'data-direction',
      'outgoing',
    );
    expect(screen.getByText('Вы')).toBeVisible();
    expect(screen.getByText(label)).toBeVisible();
  });

  it('uses a neutral incoming fallback and disables retry without an owner', () => {
    render(<Message body="Сообщение" timeLabel="18:12" state="incoming" />);
    expect(screen.getByRole('article')).toHaveAccessibleName(
      'Сообщение от Собеседник',
    );
  });

  it('emits retry without changing failed state and announces owner status', () => {
    const onRetry = vi.fn();
    render(
      <Message
        body="Сообщение"
        timeLabel="18:12"
        state="failed"
        statusMessage="Повторная отправка доступна"
        onRetry={onRetry}
      />,
    );
    const message = screen.getByRole('article');
    const retry = screen.getByRole('button', { name: 'Повторить' });
    expect(screen.getByText('Не отправлено')).toHaveClass('mm-message-error');
    expect(screen.getByRole('status')).toHaveTextContent(
      'Повторная отправка доступна',
    );
    fireEvent.click(retry);
    expect(onRetry).toHaveBeenCalledOnce();
    expect(message).toHaveAttribute('data-state', 'failed');
  });

  it('keeps retry disabled when the owner supplies no callback', () => {
    render(<Message body="Сообщение" timeLabel="18:12" state="failed" />);
    expect(screen.getByRole('button', { name: 'Повторить' })).toBeDisabled();
  });
});
