import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, IconButton } from '../src/shared/ui';

function ButtonShowcase() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  return (
    <main className="mx-auto grid max-w-[1200px] gap-8 p-4 [overflow-wrap:anywhere] md:p-6 lg:p-8">
      <header className="grid gap-2">
        <h1 className="text-heading">Кнопки</h1>
        <p className="text-muted">
          S · 44 px / M · 48 px / L · 56 px. Наведение, нажатие и фокус —
          реальные состояния.
        </p>
      </header>
      <div className="grid items-start gap-8 md:grid-cols-3">
        {(['primary', 'secondary', 'danger'] as const).map((variant) => (
          <section key={variant} aria-label={variant} className="grid gap-4">
            <h2 className="text-title">{variant}</h2>
            {(['s', 'm', 'l'] as const).map((size) => (
              <Button
                key={size}
                label={`Продолжить ${size.toUpperCase()}`}
                variant={variant}
                size={size}
                onClick={() => setCount(count + 1)}
              />
            ))}
            <Button label="Слева" variant={variant} leadingIcon="plus" />
            <Button label="Справа" variant={variant} trailingIcon="arrow" />
            <Button
              label="С обеих сторон"
              variant={variant}
              leadingIcon="plus"
              trailingIcon="arrow"
            />
            <Button
              label="Недоступно"
              variant={variant}
              disabled
              leadingIcon="plus"
              onClick={() => setCount(count + 1)}
            />
            <Button
              label="Продолжить"
              variant={variant}
              loading
              trailingIcon="arrow"
              onClick={() => setCount(count + 1)}
            />
            <Button
              label="Пригласить друзей на совместную тренировку и прогулку в выходные"
              variant={variant}
              leadingIcon="users"
              trailingIcon="arrow"
            />
          </section>
        ))}
      </div>
      <section aria-label="IconButton" className="grid gap-4">
        <h2 className="text-title">IconButton</h2>
        <div className="flex flex-wrap gap-4">
          {(['s', 'm', 'l'] as const).map((size) => (
            <IconButton
              key={size}
              label={`Добавить ${size.toUpperCase()}`}
              icon="plus"
              size={size}
              onClick={() => setCount(count + 1)}
            />
          ))}
          <IconButton
            label="Недоступно"
            icon="plus"
            disabled
            onClick={() => setCount(count + 1)}
          />
          <IconButton
            label="Загрузка"
            icon="plus"
            loading
            onClick={() => setCount(count + 1)}
          />
        </div>
      </section>
      <section aria-label="Действие" className="grid max-w-[358px] gap-4">
        <h2 className="text-title">Защита от повторного действия</h2>
        <Button
          label="Начать действие"
          loading={loading}
          onClick={() => {
            setLoading(true);
            setCount(count + 1);
          }}
        />
        <Button
          label="Завершить демонстрацию"
          variant="secondary"
          onClick={() => setLoading(false)}
        />
        <output aria-label="Количество действий">{count}</output>
      </section>
    </main>
  );
}

const meta = {
  id: 'button',
  title: 'Компоненты/Button',
  component: ButtonShowcase,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Button: label, variant primary/secondary/danger, size s/m/l, leadingIcon/trailingIcon, disabled, loading, loadingLabel. IconButton: обязательные label и icon; size, disabled, loading. Нативные DOM-атрибуты и ref передаются button, type по умолчанию button. Loading блокирует действия. [Figma Button](https://www.figma.com/design/qTLyRxJkaRvicTercpHUqr?node-id=17-97) · [Secondary](https://www.figma.com/design/qTLyRxJkaRvicTercpHUqr?node-id=35-200) · [Danger](https://www.figma.com/design/qTLyRxJkaRvicTercpHUqr?node-id=36-248) · [IconButton](https://www.figma.com/design/qTLyRxJkaRvicTercpHUqr?node-id=23-957).',
      },
    },
  },
} satisfies Meta<typeof ButtonShowcase>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
export const Light: Story = { globals: { theme: 'light' } };
export const Dark: Story = { globals: { theme: 'dark' } };
