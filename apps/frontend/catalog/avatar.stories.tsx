import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, Button } from '../src/shared/ui';
import demo from './assets/avatar-demo.png?no-inline';

function AvatarShowcase() {
  const [source, setSource] = useState<string>();
  return (
    <main className="mx-auto grid max-w-[1200px] gap-6 p-4">
      <h1 className="text-heading">Avatar</h1>
      <p>
        Фото заполняет круг. Во время загрузки и при ошибке остаются инициалы.
        Без имени — иконка пользователя.
      </p>
      {(['Изображение', 'Инициалы', 'Ошибка', 'Нет имени'] as const).map(
        (label) => (
          <section key={label} aria-label={label} className="grid gap-2">
            <h2 className="text-title">{label}</h2>
            <div className="flex items-center gap-6">
              {([32, 48, 64] as const).map((size) => (
                <Avatar
                  key={size}
                  size={size}
                  name={label === 'Нет имени' ? '' : 'Анна Котова'}
                  {...(label === 'Изображение'
                    ? { src: demo }
                    : label === 'Ошибка'
                      ? { src: 'data:image/png;base64,broken' }
                      : {})}
                />
              ))}
            </div>
          </section>
        ),
      )}
      <section aria-label="Смена изображения" className="grid gap-3">
        <h2 className="text-title">Смена изображения</h2>
        <Avatar name="Мария Котова" {...(source ? { src: source } : {})} />
        <div className="flex flex-wrap gap-3">
          <Button
            label="Загрузить изображение"
            onClick={() => setSource(demo + '?replacement')}
          />
          <Button
            label="Проверить ошибку"
            variant="secondary"
            onClick={() => setSource('data:image/png;base64,broken')}
          />
          <Button
            label="Убрать изображение"
            variant="secondary"
            onClick={() => setSource(undefined)}
          />
        </div>
      </section>
      <div className="flex items-center gap-3">
        <Avatar name="Анна Котова" decorative size={32} />
        <span>Анна Котова · декоративный Avatar рядом с именем</span>
      </div>
    </main>
  );
}
const meta = {
  id: 'avatar',
  title: 'Компоненты/Avatar',
  component: AvatarShowcase,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Avatar: name, src?, size 32/48/64 (48 по умолчанию), decorative?, className?. Инициалы из первого и последнего слова, для одного слова — одна буква. Ошибка не повторяет запрос; смена URL сбрасывает состояние. Для действия нужен внешний button/link с доступным именем и touch-target 44 px. [Figma](https://www.figma.com/design/qTLyRxJkaRvicTercpHUqr?node-id=52-69).',
      },
    },
  },
} satisfies Meta<typeof AvatarShowcase>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
export const Light: Story = { globals: { theme: 'light' } };
export const Dark: Story = { globals: { theme: 'dark' } };
