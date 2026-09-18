import { StrictMode, createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Dialog } from './dialog';

const base = {
  title: 'Отменить заявку?',
  confirmLabel: 'Отменить заявку',
  cancelLabel: 'Оставить',
};
beforeEach(() => {
  // jsdom has no top layer. Browser tests verify native modality and focus containment.
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.open = true;
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.open = false;
    },
  });
});
afterEach(() => {
  document.querySelectorAll('[data-trigger]').forEach((n) => n.remove());
});
it('opens once under StrictMode, focuses the safe action and restores the trigger', () => {
  const trigger = document.createElement('button');
  trigger.dataset.trigger = '';
  document.body.append(trigger);
  trigger.focus();
  const close = vi.fn();
  const confirm = vi.fn();
  const { rerender } = render(
    <StrictMode>
      <Dialog
        {...base}
        open
        description="Можно повторить позже"
        onClose={close}
        onConfirm={confirm}
      />
    </StrictMode>,
  );
  expect(screen.getByRole('dialog')).toHaveAccessibleName(base.title);
  expect(screen.getByRole('dialog')).toHaveAccessibleDescription(
    'Можно повторить позже',
  );
  expect(screen.getByRole('button', { name: 'Оставить' })).toHaveFocus();
  fireEvent.click(screen.getByRole('button', { name: 'Отменить заявку' }));
  expect(confirm).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole('button', { name: 'Оставить' }));
  expect(close).toHaveBeenCalledOnce();
  rerender(
    <StrictMode>
      <Dialog {...base} open={false} onClose={close} onConfirm={confirm} />
    </StrictMode>,
  );
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});
it('preserves content on error, disables pending submission, allows cancel and ignores backdrop clicks', () => {
  const close = vi.fn();
  const confirm = vi.fn();
  const { rerender } = render(
    <Dialog {...base} open pending onClose={close} onConfirm={confirm}>
      <input aria-label="Причина" defaultValue="Мой текст" />
    </Dialog>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Подождите…' }));
  expect(confirm).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('dialog'));
  expect(close).not.toHaveBeenCalled();
  const cancel = new Event('cancel', { cancelable: true });
  fireEvent(screen.getByRole('dialog'), cancel);
  expect(cancel.defaultPrevented).toBe(true);
  expect(close).toHaveBeenCalledOnce();
  rerender(
    <Dialog
      {...base}
      open
      error="Ошибка отправки"
      onClose={close}
      onConfirm={confirm}
    >
      <input aria-label="Причина" defaultValue="Мой текст" />
    </Dialog>,
  );
  expect(screen.getByRole('alert')).toHaveTextContent('Ошибка отправки');
  expect(screen.getByRole('textbox')).toHaveValue('Мой текст');
  fireEvent.click(screen.getByRole('button', { name: 'Отменить заявку' }));
  expect(confirm).toHaveBeenCalledOnce();
});
it('handles native close, ignores stale close events and restores a fallback after trigger removal', () => {
  const fallback = createRef<HTMLButtonElement>();
  const close = vi.fn();
  const trigger = document.createElement('button');
  trigger.dataset.trigger = '';
  document.body.append(trigger);
  trigger.focus();
  const view = render(
    <>
      <button ref={fallback}>Список</button>
      <Dialog
        {...base}
        open
        onClose={close}
        onConfirm={vi.fn()}
        returnFocusRef={fallback}
      />
    </>,
  );
  const dialog = screen.getByRole('dialog') as HTMLDialogElement;
  fireEvent(dialog, new Event('close'));
  expect(close).not.toHaveBeenCalled();
  dialog.close();
  fireEvent(dialog, new Event('close'));
  expect(close).toHaveBeenCalledOnce();
  trigger.remove();
  view.rerender(
    <>
      <button ref={fallback}>Список</button>
      <Dialog
        {...base}
        open={false}
        onClose={close}
        onConfirm={vi.fn()}
        returnFocusRef={fallback}
      />
    </>,
  );
  expect(fallback.current).toHaveFocus();
  fireEvent(dialog, new Event('close'));
  expect(close).toHaveBeenCalledOnce();
});
it('can unmount after its trigger is removed without a fallback', () => {
  const trigger = document.createElement('button');
  trigger.dataset.trigger = '';
  document.body.append(trigger);
  trigger.focus();
  const { unmount } = render(
    <Dialog {...base} open onClose={vi.fn()} onConfirm={vi.fn()} />,
  );
  trigger.remove();
  expect(unmount).not.toThrow();
});

it('wraps Tab at both ends and skips disabled, hidden and negative-tabindex controls', () => {
  vi.spyOn(HTMLElement.prototype, 'getClientRects').mockImplementation(
    function (this: HTMLElement) {
      return (this.hidden ? [] : [{}]) as unknown as DOMRectList;
    },
  );
  const { container } = render(
    <Dialog {...base} open onClose={vi.fn()} onConfirm={vi.fn()}>
      <button hidden>Скрыто</button>
      <button disabled>Недоступно</button>
      <button tabIndex={-1}>Программно</button>
    </Dialog>,
  );
  const first = container.querySelector<HTMLElement>('.mm-dialog-content')!;
  const last = screen.getByRole('button', { name: 'Отменить заявку' });
  last.focus();
  fireEvent.keyDown(last, { key: 'Tab' });
  expect(first).toHaveFocus();
  fireEvent.keyDown(first, { key: 'Tab', shiftKey: true });
  expect(last).toHaveFocus();
  first.focus();
  fireEvent.keyDown(first, { key: 'Tab' });
  expect(first).toHaveFocus();
  last.focus();
  fireEvent.keyDown(last, { key: 'Tab', shiftKey: true });
  expect(last).toHaveFocus();
  fireEvent.keyDown(last, { key: 'ArrowLeft' });
  expect(last).toHaveFocus();
});
