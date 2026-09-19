import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Checkbox,
  EventCard,
  Message,
  PostCard,
  WorkoutEntry,
} from '../src/shared/ui';

const event = {
  dateTime: '2026-09-19T18:30:00+03:00',
  dateLabel: '19 сентября · 18:30',
  timeZoneLabel: 'МСК',
  title: 'Прогулка у воды',
  details: 'Набережная · 4 участника',
} as const;

function Showcase() {
  const [eventJoined, setEventJoined] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const longMessage =
    'Привет! Предлагаю встретиться в субботу после обеда, спокойно обсудить планы на поездку и выбрать удобный маршрут для всей компании.';

  return (
    <main className="grid min-w-0 gap-8 p-4 [overflow-wrap:anywhere] sm:p-6 lg:p-8">
      <h1 className="text-heading">Контент и общение</h1>
      <p>
        Presentation-only компоненты FE-20. Данные и подтверждённые состояния
        передаёт владелец; примеры не обращаются к серверу.
      </p>

      <section aria-label="Message · все состояния" className="grid gap-3">
        <h2 className="text-title">Message</h2>
        <Message
          author="Анна"
          body="Привет! Давай встретимся вечером у набережной."
          timeLabel="18:12"
          state="incoming"
        />
        <Message
          body="Привет! Давай встретимся вечером у набережной."
          timeLabel="18:12"
          state="sent"
        />
        <Message body="Уже выхожу" timeLabel="18:13" state="sending" />
        <Message
          body="Буду через десять минут"
          timeLabel="18:14"
          state="failed"
          onRetry={() => undefined}
        />
      </section>

      <section aria-label="EventCard · все состояния" className="grid gap-4">
        <h2 className="text-title">EventCard</h2>
        <EventCard
          {...event}
          {...(eventJoined
            ? { state: 'joined' as const, href: '#event' }
            : {
                state: 'invited' as const,
                ...(showErrors
                  ? {
                      error:
                        'Не удалось принять приглашение. Попробуйте ещё раз.',
                    }
                  : {}),
                onAccept: () => setEventJoined(true),
              })}
        />
        <EventCard {...event} state="joined" href="#event" />
        <EventCard {...event} state="cancelled" />
      </section>

      <section aria-label="PostCard · состояния" className="grid gap-4">
        <h2 className="text-title">PostCard</h2>
        <PostCard
          author="Анна Кузнецова"
          publishedLabel="Сегодня, 12:40"
          audience="Для друзей"
          body="Нашли новый маршрут у реки. В следующий раз берём термос и идём вместе!"
          reactionCount={liked ? 13 : 12}
          liked={liked}
          {...(showErrors
            ? { error: 'Не удалось изменить реакцию. Попробуйте ещё раз.' }
            : {})}
          onReaction={() => setLiked((value) => !value)}
        />
        <PostCard
          author="Иван Петров"
          publishedLabel="Вчера, 20:15"
          audience="Для группы"
          body="Тренировка завершена."
          reactionCount={4}
          liked
          onReaction={() => undefined}
        />
      </section>

      <section
        aria-label="WorkoutEntry · узкий контейнер"
        className="grid max-w-[358px] gap-4"
      >
        <h2 className="text-title">WorkoutEntry · mobile container</h2>
        <WorkoutEntry
          metric="strength"
          dateLabel="18 сентября 2026"
          exercise="Приседания"
          sets={3}
          repetitions={12}
          weightLabel="40 кг"
          onAction={() => undefined}
        />
        <WorkoutEntry
          metric="distance"
          dateLabel="18 сентября 2026"
          activity="Бег"
          distanceLabel="12 км"
          durationLabel="1 ч 08 мин"
          onAction={() => undefined}
        />
        <WorkoutEntry
          metric="summary"
          dateLabel="01–18 сентября 2026"
          periodLabel="Сводка периода"
          lastResult="3 × 12 × 40 кг"
          compressedAtLabel="18.09"
          lastResultAtLabel="18.09"
          href="#summary"
        />
      </section>

      <section
        aria-label="WorkoutEntry · широкий контейнер"
        className="grid max-w-[920px] gap-4"
      >
        <h2 className="text-title">WorkoutEntry · desktop container</h2>
        <WorkoutEntry
          metric="strength"
          dateLabel="18.09.2026"
          exercise="Приседания"
          sets={3}
          repetitions={12}
          weightLabel="40 кг"
          onAction={() => undefined}
        />
        <WorkoutEntry
          metric="distance"
          dateLabel="18.09.2026"
          activity="Бег"
          distanceLabel="12 км"
          durationLabel="1:08:00"
          onAction={() => undefined}
        />
        <WorkoutEntry
          metric="summary"
          dateLabel="01–18 сен"
          periodLabel="Сводка периода"
          lastResult="3 × 12 × 40 кг"
          compressedAtLabel="18.09"
          lastResultAtLabel="18.09"
          href="#summary"
        />
      </section>

      <section
        aria-label="Загрузка и ошибки"
        className="grid max-w-[760px] gap-4"
      >
        <h2 className="text-title">Loading / error</h2>
        <Checkbox
          label="Показывать ошибки действий"
          checked={showErrors}
          onCheckedChange={setShowErrors}
        />
        <EventCard
          {...event}
          state="invited"
          loading
          onAccept={() => undefined}
        />
        <PostCard
          author="Анна Кузнецова"
          publishedLabel="Сегодня, 12:40"
          audience="Для друзей"
          body="Нашли новый маршрут у реки."
          reactionCount={12}
          liked={false}
          loading
          onReaction={() => undefined}
        />
      </section>

      <section
        aria-label="Длинный контент"
        className="grid max-w-[760px] gap-4"
      >
        <h2 className="text-title">Длинный контент и 200% текста</h2>
        <Message
          author="Анна"
          body={longMessage}
          timeLabel="18:12"
          state="incoming"
        />
        <EventCard
          {...event}
          title="Большая совместная прогулка с друзьями и семьями у воды"
          state="invited"
          onAccept={() => undefined}
        />
        <PostCard
          author="Анна Кузнецова"
          publishedLabel="Сегодня, 12:40"
          audience="Для друзей"
          body={longMessage}
          reactionCount={12}
          liked={false}
          onReaction={() => undefined}
        />
      </section>

      <section id="event">
        <h2 className="text-title">Событие · пример назначения ссылки</h2>
      </section>
      <section id="summary">
        <h2 className="text-title">Сводка · пример назначения ссылки</h2>
      </section>
    </main>
  );
}

const meta = {
  id: 'content-cards',
  title: 'Компоненты/Контент и общение',
  component: Showcase,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Message, EventCard, PostCard и WorkoutEntry используют generated UI-конфигурации и container queries. Callbacks и ссылки принадлежат владельцу; сетевых запросов нет. [Figma](https://www.figma.com/design/qTLyRxJkaRvicTercpHUqr?node-id=73-5577).',
      },
    },
  },
} satisfies Meta<typeof Showcase>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
export const Light: Story = { globals: { theme: 'light' } };
export const Dark: Story = { globals: { theme: 'dark' } };
