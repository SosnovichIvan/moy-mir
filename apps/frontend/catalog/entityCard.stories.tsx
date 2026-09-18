import { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  Checkbox,
  EntityCard,
  type EntityCardAction,
  type EntityCardConfiguration,
} from '../src/shared/ui';
import demo from './assets/avatar-demo.png?no-inline';

const examples = [
  { name: 'Анна Кузнецова', state: 'new', detail: '@anna · Москва' },
  { name: 'Анна Кузнецова', state: 'pending', detail: 'Заявка отправлена' },
  { name: 'Анна Кузнецова', state: 'incoming', detail: 'Хочет добавить вас' },
  {
    name: 'Анна Кузнецова',
    state: 'friend',
    detail: 'У вас в друзьях',
    href: '#profile',
  },
  {
    name: 'Анна Кузнецова',
    state: 'blocked',
    detail: 'Пользователь заблокирован',
  },
  {
    name: 'Бегаем вместе',
    state: 'member',
    detail: '128 участников · Закрытая группа',
    href: '#group',
  },
] as const satisfies readonly EntityCardConfiguration[];

const errors = {
  add: 'Не удалось отправить заявку. Попробуйте ещё раз.',
  cancel: 'Не удалось отменить заявку. Попробуйте ещё раз.',
  accept: 'Не удалось принять заявку. Попробуйте ещё раз.',
  decline: 'Не удалось отклонить заявку. Попробуйте ещё раз.',
  unblock: 'Не удалось разблокировать пользователя. Попробуйте ещё раз.',
} satisfies Record<EntityCardAction, string>;

// Demo-only owner: no network requests or assertions about the future backend contract.
function InteractiveCard({ initial }: { initial: EntityCardConfiguration }) {
  const [configuration, setConfiguration] = useState(initial);
  const [fail, setFail] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  function onAction(action: EntityCardAction) {
    const loading =
      action === 'add'
        ? ({ state: 'new', loadingAction: action } as const)
        : action === 'cancel'
          ? ({ state: 'pending', loadingAction: action } as const)
          : action === 'unblock'
            ? ({ state: 'blocked', loadingAction: action } as const)
            : ({ state: 'incoming', loadingAction: action } as const);
    setConfiguration({
      name: initial.name,
      detail: configuration.detail ?? '',
      ...loading,
    });
    timer.current = setTimeout(() => {
      if (fail) {
        setConfiguration({ ...configuration, error: errors[action] });
        return;
      }
      const result =
        action === 'add'
          ? examples[1]
          : action === 'accept'
            ? examples[3]
            : examples[0];
      setConfiguration({
        ...result,
        name: initial.name,
        statusMessage: `${initial.name}: ${result.detail}`,
      });
    }, 800);
  }

  return (
    <section
      className="grid min-w-0 gap-3"
      aria-label={`Сценарий ${initial.state}`}
    >
      <Checkbox
        label={`Ошибка следующего действия (${initial.state})`}
        checked={fail}
        onCheckedChange={setFail}
      />
      <EntityCard {...configuration} onAction={onAction} />
      <Button
        label={`Сбросить ${initial.state}`}
        variant="secondary"
        onClick={() => {
          clearTimeout(timer.current);
          setConfiguration(initial);
        }}
      />
    </section>
  );
}

function Showcase() {
  const [message, setMessage] = useState('');
  const [long, setLong] = useState(false);
  return (
    <main className="grid min-w-0 gap-6 p-4 [overflow-wrap:anywhere]">
      <h1 className="text-heading">EntityCard</h1>
      <p>
        Карточки пользователей и групп. Компоновка зависит от ширины контейнера.
        Интерактивные примеры ниже имитируют ответ без обращения к серверу.
      </p>
      <Checkbox
        label="Длинные имена и описания"
        checked={long}
        onCheckedChange={setLong}
      />
      <section aria-label="Все состояния" className="grid min-w-0 gap-4">
        {examples.map((item) => (
          <EntityCard
            key={item.state}
            {...item}
            {...(long
              ? {
                  name:
                    item.state === 'member'
                      ? 'Бегаем вместе по набережным города'
                      : 'Александра Константинопольская',
                  detail:
                    'Длинное описание без обрезки текста и потери важных подробностей',
                }
              : {})}
            onAction={(action) => setMessage(`Выбрано действие: ${action}`)}
          />
        ))}
        <span role="status">{message}</span>
      </section>
      <section
        aria-label="Узкий контейнер"
        className="grid min-w-0 max-w-[358px] gap-4"
      >
        <h2 className="text-title">Карточка в колонке</h2>
        <EntityCard
          {...examples[2]}
          onAction={(action) => setMessage(`Выбрано действие: ${action}`)}
        />
      </section>
      <section aria-label="Контент" className="grid min-w-0 gap-4">
        <h2 className="text-title">Фото, fallback и необязательное описание</h2>
        <EntityCard
          name="Мария Котова"
          state="friend"
          href="#profile"
          avatarSrc={demo}
        />
        <EntityCard
          name="Иван Петров"
          state="friend"
          href="#profile"
          avatarSrc="data:image/png;base64,broken"
        />
        <EntityCard
          name={'ОченьДлинноеИмяБезПробелов'.repeat(4)}
          state="new"
          detail={'ДлинноеОписание'.repeat(10)}
          onAction={() => setMessage('Выбрано действие: add')}
        />
      </section>
      <section aria-label="Загрузка и ошибки" className="grid min-w-0 gap-4">
        <h2 className="text-title">Интерактивные сценарии</h2>
        {examples
          .filter((item) =>
            ['new', 'pending', 'incoming', 'blocked'].includes(item.state),
          )
          .map((initial) => (
            <InteractiveCard key={initial.state} initial={initial} />
          ))}
      </section>
      <section id="profile" aria-label="Пример назначения ссылки">
        <h2 className="text-title">Профиль · пример назначения ссылки</h2>
      </section>
      <section id="group">
        <h2 className="text-title">Группа · пример назначения ссылки</h2>
      </section>
    </main>
  );
}

const meta = {
  id: 'entity-card',
  title: 'Компоненты/EntityCard',
  component: Showcase,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'EntityCard: name, state, detail?, avatarSrc?, loadingAction?, error?, statusMessage?. Friend/Member требуют href. onAction сообщает о действии; linkProps поддерживает нативные ссылки и router-адаптер. Состояние контролирует владелец, сетевых запросов нет. [Figma](https://www.figma.com/design/qTLyRxJkaRvicTercpHUqr?node-id=66-4723).',
      },
    },
  },
} satisfies Meta<typeof Showcase>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
export const Light: Story = { globals: { theme: 'light' } };
export const Dark: Story = { globals: { theme: 'dark' } };
