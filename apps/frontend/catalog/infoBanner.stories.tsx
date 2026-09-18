import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  InfoBanner,
  Button,
  type InfoBannerConfiguration,
} from '../src/shared/ui';

const examples = [
  {
    state: 'empty',
    title: 'Пока никого нет',
    body: 'Найдите друзей по имени или нику.',
  },
  {
    state: 'loading',
    title: 'Загружаем список',
    body: 'Это может занять несколько секунд.',
  },
  {
    state: 'error',
    title: 'Не удалось загрузить',
    body: 'Проверьте соединение и попробуйте снова.',
  },
  {
    state: 'offline',
    title: 'Нет подключения',
    body: 'Подключитесь к сети и повторите попытку.',
  },
  {
    state: 'permission',
    title: 'Нет доступа',
    body: 'У вас нет доступа к этому разделу.',
  },
  { state: 'success', title: 'Готово', body: 'Заявка в друзья отправлена.' },
] as const satisfies readonly InfoBannerConfiguration[];
function Showcase() {
  const [complete, setComplete] = useState(false);
  return (
    <main className="mx-auto grid max-w-[1200px] gap-6 p-4">
      <h1 className="text-heading">InfoBanner</h1>
      {(['s', 'm', 'l'] as const).map((size) => (
        <section
          aria-label={`Размер ${size}`}
          key={size}
          className="grid gap-4"
        >
          <h2 className="text-title">Размер {size.toUpperCase()}</h2>
          {examples.map((example) => (
            <InfoBanner
              key={example.state}
              {...example}
              size={size}
              action={
                example.state !== 'success' ? (
                  <Button
                    label={
                      example.state === 'empty'
                        ? 'Найти друзей'
                        : example.state === 'permission'
                          ? 'К списку'
                          : 'Повторить'
                    }
                    variant="secondary"
                  />
                ) : undefined
              }
            />
          ))}
        </section>
      ))}
      <section aria-label="Длинный текст" className="grid gap-4">
        <h2 className="text-title">Длинный текст и состояния действия</h2>
        {(['default', 'disabled', 'loading'] as const).map((state) => (
          <InfoBanner
            key={state}
            state="error"
            title="Не удалось загрузить список участников"
            body="Соединение прервалось. Данные останутся на месте — повторите попытку, когда подключение восстановится."
            action={
              <Button
                label="Повторить загрузку списка участников"
                disabled={state === 'disabled'}
                loading={state === 'loading'}
              />
            }
          />
        ))}
      </section>
      <section aria-label="Обновление результата" className="grid gap-4">
        <h2 className="text-title">Обновление результата</h2>
        <InfoBanner
          state={complete ? 'success' : 'empty'}
          title={complete ? 'Готово' : 'Пока никого нет'}
          body={
            complete ? 'Список обновлён.' : 'Нажмите кнопку для демонстрации.'
          }
          announcement="polite"
        />
        <Button label="Обновить результат" onClick={() => setComplete(true)} />
      </section>
    </main>
  );
}
const meta = {
  id: 'info-banner',
  title: 'Компоненты/InfoBanner',
  component: Showcase,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'InfoBanner: state, title, body, size s/m/l, announcement off/polite/assertive. action — слот существующего Button, скрыт в loading. Обновляйте содержимое уже смонтированной live region; не дублируйте объявления на экране. [Figma](https://www.figma.com/design/qTLyRxJkaRvicTercpHUqr?node-id=56-3425).',
      },
    },
  },
} satisfies Meta<typeof Showcase>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
export const Light: Story = { globals: { theme: 'light' } };
export const Dark: Story = { globals: { theme: 'dark' } };
