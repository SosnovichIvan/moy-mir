import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Badge,
  CountBadge,
  Button,
  type BadgeConfiguration,
} from '../src/shared/ui';

const examples = [
  { tone: 'neutral', label: 'Участник', leadingIcon: 'user' },
  { tone: 'pending', label: 'Приглашение', leadingIcon: 'user' },
  { tone: 'success', label: 'Добавлен', leadingIcon: 'check' },
  { tone: 'error', label: 'Не отправлено', leadingIcon: 'close' },
] as const satisfies readonly BadgeConfiguration[];
function BadgeShowcase() {
  const [count, setCount] = useState(99);
  return (
    <main className="mx-auto grid max-w-[1200px] gap-6 p-4">
      <h1 className="text-heading">Badge</h1>
      <p>
        Статусы и счётчики. Это подписи, а не кнопки. Длинный текст доступен без
        наведения.
      </p>
      {examples.map(({ tone, label, leadingIcon }) => (
        <section aria-label={tone} key={tone} className="grid gap-2">
          <h2 className="text-title">{tone}</h2>
          <div className="flex flex-wrap items-start gap-2">
            <Badge label={label} tone={tone} />
            <Badge label={label} tone={tone} leadingIcon={leadingIcon} />
            <Badge label={label} tone={tone} trailingIcon={leadingIcon} />
            <Badge
              label={label}
              tone={tone}
              leadingIcon={leadingIcon}
              trailingIcon={leadingIcon}
            />
          </div>
        </section>
      ))}
      <section aria-label="Счётчики" className="grid gap-2">
        <h2 className="text-title">Счётчики · 24 px</h2>
        <div className="flex flex-wrap gap-3">
          {[0, 3, 9, 10, 99, 1234].map((value) => (
            <CountBadge
              key={value}
              count={value}
              label="Непрочитанные сообщения"
            />
          ))}
        </div>
      </section>
      <section aria-label="Длинная подпись" className="grid max-w-72 gap-3">
        <h2 className="text-title">Длинная подпись</h2>
        <Badge
          tone="pending"
          label="Приглашение в группу любителей утренних пробежек"
          leadingIcon="user"
        />
        <Badge
          tone="error"
          label="Не удалось отправить приглашение"
          leadingIcon="close"
        />
        <Badge
          label="ОченьДлинноеНазваниеБезПробеловДляПроверкиПереноса"
          leadingIcon="user"
          trailingIcon="check"
        />
      </section>
      <section aria-label="Изменить счётчик" className="grid gap-3">
        <h2 className="text-title">Изменить счётчик</h2>
        <CountBadge count={count} label="Заявки" />
        <Button label="Добавить заявку" onClick={() => setCount(count + 1)} />
        <p role="status">Заявки: {count}</p>
      </section>
    </main>
  );
}
const meta = {
  id: 'badge',
  title: 'Компоненты/Badge',
  component: BadgeShowcase,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Badge: label, tone neutral/pending/success/error, leadingIcon?, trailingIcon?, className?. CountBadge: count (неотрицательное безопасное целое), label (контекст), className?. Отображение ограничено 99+, доступный текст содержит полное число. Ноль показывается; скрывать его решает экран. Live region принадлежит экрану. [Figma](https://www.figma.com/design/qTLyRxJkaRvicTercpHUqr?node-id=53-253).',
      },
    },
  },
} satisfies Meta<typeof BadgeShowcase>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
export const Light: Story = { globals: { theme: 'light' } };
export const Dark: Story = { globals: { theme: 'dark' } };
