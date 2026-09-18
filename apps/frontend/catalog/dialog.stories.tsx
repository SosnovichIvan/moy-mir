import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Dialog, TextField } from '../src/shared/ui';

function Showcase() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [long, setLong] = useState(false);
  const [result, setResult] = useState('');
  const [reason, setReason] = useState('');
  const [removeTrigger, setRemoveTrigger] = useState(false);
  const [focusDemo, setFocusDemo] = useState(false);
  const fallback = useRef<HTMLHeadingElement>(null);
  const request = useRef(false);
  function confirm() {
    if (request.current) return;
    request.current = true;
    setPending(true);
    setError('');
    // The screen owns this demo operation: closing the modal does not discard its result.
    window.setTimeout(() => {
      request.current = false;
      setPending(false);
      setError('Не удалось отменить заявку. Попробуйте снова.');
      setResult('Операция завершилась ошибкой. Повторите попытку.');
    }, 700);
  }
  function show(isLong: boolean) {
    setLong(isLong);
    setOpen(true);
  }
  return (
    <main className="mx-auto grid max-w-[760px] gap-6 p-4">
      <h1 className="text-heading" ref={fallback} tabIndex={-1}>
        Dialog
      </h1>
      <p>
        Подтверждение действия. Escape и «Оставить» закрывают окно; клик по фону
        сохраняет его открытым.
      </p>
      {!removeTrigger && (
        <Button label="Открыть диалог" onClick={() => show(false)} />
      )}
      <Button label="Открыть длинный диалог" onClick={() => show(true)} />
      <label>
        <input
          type="checkbox"
          checked={focusDemo}
          onChange={(event) => setFocusDemo(event.target.checked)}
        />{' '}
        Проверить удаление инициатора
      </label>
      {!open && <p role="status">{result}</p>}
      <Dialog
        open={open}
        title="Отменить заявку?"
        description="Вы сможете отправить её снова позже."
        confirmLabel="Отменить заявку"
        cancelLabel="Оставить"
        pending={pending}
        error={error}
        onClose={() => setOpen(false)}
        onConfirm={confirm}
        returnFocusRef={fallback}
      >
        {long && (
          <div className="grid gap-4 pt-4">
            {Array.from({ length: 12 }, (_, i) => (
              <p key={i}>
                Отмена заявки не удаляет переписку и не блокирует пользователя.
                Если передумали, нажмите «Оставить».
              </p>
            ))}
            <TextField
              label="Причина"
              value={reason}
              onValueChange={setReason}
            />
          </div>
        )}
        {focusDemo && !removeTrigger && (
          <Button
            label="Убрать инициатор"
            variant="secondary"
            onClick={() => setRemoveTrigger(true)}
          />
        )}
      </Dialog>
      <div className="h-[100vh]" aria-hidden="true" />
      <p>
        Конец фоновой страницы — её прокрутка блокируется при открытом окне.
      </p>
    </main>
  );
}
const meta = {
  id: 'dialog',
  title: 'Компоненты/Dialog',
  component: Showcase,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Управляемый native dialog: open, title, description?, confirmLabel, cancelLabel, pending?, error?. onClose запрашивает закрытие, onConfirm передаёт действие экрану. children — составное содержимое. returnFocusRef — запасной фокус при удалении инициатора. Экран владеет запросом и блокирует повторный submit синхронно. [Figma](https://www.figma.com/design/qTLyRxJkaRvicTercpHUqr?node-id=58-136).',
      },
    },
  },
} satisfies Meta<typeof Showcase>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
export const Light: Story = { globals: { theme: 'light' } };
export const Dark: Story = { globals: { theme: 'dark' } };
