import { useId, type ComponentProps } from 'react';
import type { EventCardConfiguration } from './generated/eventCard';
import { Button } from './button';

const stateLabels = {
  invited: 'Вас пригласили',
  joined: 'Вы участвуете',
  cancelled: 'Событие отменено',
} satisfies Record<EventCardConfiguration['state'], string>;

type EventCardProps = EventCardConfiguration & {
  onAccept?: () => void;
  linkProps?: Omit<
    ComponentProps<'a'>,
    'href' | 'children' | 'dangerouslySetInnerHTML'
  >;
  className?: string;
};

export function EventCard({
  dateTime,
  dateLabel,
  timeZoneLabel,
  title,
  details,
  state,
  loading = false,
  error,
  statusMessage,
  onAccept,
  linkProps,
  className,
  ...configuration
}: EventCardProps) {
  const titleId = useId();
  const errorId = useId();

  return (
    <article
      className={['mm-event-card', className].filter(Boolean).join(' ')}
      data-state={state}
      aria-labelledby={titleId}
    >
      <div className="mm-event-card-content">
        <div className="mm-event-card-info">
          <time dateTime={dateTime} className="mm-event-card-date">
            {dateLabel} · {timeZoneLabel}
          </time>
          <h3 id={titleId} className="mm-event-card-title">
            {title}
          </h3>
          <p className="mm-event-card-details">{details}</p>
          <p
            className="mm-event-card-state"
            data-danger={state === 'cancelled'}
          >
            {stateLabels[state]}
          </p>
        </div>
        <div className="mm-event-card-action" aria-busy={loading}>
          {state === 'invited' && (
            <Button
              label="Принять приглашение"
              loadingLabel="Принимаем приглашение…"
              loading={loading}
              disabled={!onAccept}
              aria-describedby={error ? errorId : undefined}
              onClick={onAccept}
            />
          )}
          {state === 'joined' && (
            <a
              {...linkProps}
              href={configuration.href}
              className={['mm-card-link', linkProps?.className]
                .filter(Boolean)
                .join(' ')}
            >
              Открыть событие
            </a>
          )}
        </div>
      </div>
      {state === 'invited' && (
        <p id={errorId} className="mm-card-error" role="alert">
          {error}
        </p>
      )}
      <span className="sr-only" role="status" aria-atomic="true">
        {loading ? 'Принимаем приглашение…' : statusMessage}
      </span>
    </article>
  );
}
