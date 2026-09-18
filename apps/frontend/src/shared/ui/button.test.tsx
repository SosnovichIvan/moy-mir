import { createRef, type ComponentProps } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button, IconButton } from './index';

describe.each(['text', 'icon'] as const)('%s button', (kind) => {
  const Component =
    kind === 'text'
      ? Button
      : (props: Omit<ComponentProps<typeof IconButton>, 'icon'>) => (
          <IconButton {...props} icon="plus" />
        );

  it('has an accessible name, forwards refs and activates once', () => {
    const ref = createRef<HTMLButtonElement>();
    const onClick = vi.fn();
    render(
      <>
        <p id="hint">Добавить друга</p>
        <Component
          label="Добавить"
          ref={ref}
          onClick={onClick}
          aria-describedby="hint"
          className="custom"
          id="add"
        />
      </>,
    );
    const button = screen.getByRole('button', { name: 'Добавить' });
    expect(ref.current).toBe(button);
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAccessibleDescription('Добавить друга');
    expect(button).toHaveClass('custom', 'mm-button');
    expect(button).toHaveAttribute('id', 'add');
    expect(button).toHaveAttribute('aria-busy', 'false');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it.each(['disabled', 'loading'] as const)(
    '%s prevents actions and preserves recovery',
    (state) => {
      const onClick = vi.fn();
      const { rerender } = render(
        <Component
          label="Добавить"
          disabled={state === 'disabled'}
          loading={state === 'loading'}
          onClick={onClick}
        />,
      );
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', String(state === 'loading'));
      if (state === 'loading') {
        expect(button).toHaveAccessibleName(
          kind === 'text' ? 'Подождите…' : 'Добавить',
        );
      }
      fireEvent.click(button);
      expect(onClick).not.toHaveBeenCalled();
      rerender(<Component label="Добавить" onClick={onClick} />);
      expect(button).toBeEnabled();
      fireEvent.click(button);
      expect(onClick).toHaveBeenCalledOnce();
    },
  );

  it('keeps native form bindings for explicit submit buttons', () => {
    const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={submit}>
        <Component label="Сохранить" type="submit" name="action" value="save" />
      </form>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('name', 'action');
    expect(button).toHaveAttribute('value', 'save');
    fireEvent.click(button);
    expect(submit).toHaveBeenCalledOnce();
  });
});

it('renders both decorative icons around text and a custom loading message', () => {
  const { rerender } = render(
    <Button
      label="Отправить"
      leadingIcon="plus"
      trailingIcon="arrow"
      variant="secondary"
      size="l"
    />,
  );
  const button = screen.getByRole('button', { name: 'Отправить' });
  const content = button.querySelector('.mm-button-content')!;
  expect(content.children).toHaveLength(3);
  expect(content.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  expect(content.lastElementChild).toHaveAttribute('aria-hidden', 'true');
  expect(button).toHaveAttribute('data-size', 'l');
  expect(button).toHaveAttribute('data-variant', 'secondary');
  rerender(<Button label="Отправить" loading loadingLabel="Отправляем…" />);
  expect(button).toHaveAccessibleName('Отправляем…');
  expect(button).toBeDisabled();
});

it('keeps its original label in a hidden sizing layer while showing the spinner', () => {
  render(<Button label="Пригласить друзей" leadingIcon="plus" loading />);
  const button = screen.getByRole('button', { name: 'Подождите…' });
  expect(button.querySelector('.mm-button-content')).toHaveAttribute(
    'aria-hidden',
    'true',
  );
  expect(button.querySelector('.mm-button-loading')).toHaveAttribute(
    'aria-hidden',
    'true',
  );
});

it('supports a trailing-only icon and a custom accessible name', () => {
  render(
    <Button label="Далее" trailingIcon="arrow" aria-label="Перейти далее" />,
  );
  const button = screen.getByRole('button', { name: 'Перейти далее' });
  expect(button.querySelector('.mm-button-content')).toHaveAttribute(
    'data-icons',
    'true',
  );
  expect(button.querySelectorAll('.mm-icon')).toHaveLength(1);
});
