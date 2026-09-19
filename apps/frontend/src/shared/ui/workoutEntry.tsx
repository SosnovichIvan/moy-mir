import { useId, type ComponentProps } from 'react';
import type { WorkoutEntryConfiguration } from './generated/workoutEntry';
import { Button } from './button';

type WorkoutEntryProps = WorkoutEntryConfiguration & {
  onAction?: () => void;
  linkProps?: Omit<
    ComponentProps<'a'>,
    'href' | 'children' | 'dangerouslySetInnerHTML'
  >;
  className?: string;
};

function result(configuration: WorkoutEntryConfiguration) {
  switch (configuration.metric) {
    case 'strength':
      return {
        title: configuration.exercise,
        result: `${configuration.sets} × ${configuration.repetitions} × ${configuration.weightLabel}`,
        status: 'Выполнено',
      };
    case 'distance':
      return {
        title: configuration.activity,
        result: `${configuration.distanceLabel} · ${configuration.durationLabel}`,
        status: 'Выполнено',
      };
    case 'summary':
      return {
        title: configuration.periodLabel,
        result: configuration.lastResult,
        status: `Сжато ${configuration.compressedAtLabel} · Последний: ${configuration.lastResultAtLabel}`,
      };
  }
}

export function WorkoutEntry({
  onAction,
  linkProps,
  className,
  ...configuration
}: WorkoutEntryProps) {
  const titleId = useId();
  const content = result(configuration);
  const isSummary = configuration.metric === 'summary';
  const actionLabel = isSummary ? 'Открыть сводку' : 'Изменить результат';

  return (
    <article
      className={['mm-workout-entry', className].filter(Boolean).join(' ')}
      data-metric={configuration.metric}
      aria-labelledby={titleId}
    >
      <div className="mm-workout-entry-content">
        <p className="mm-workout-entry-date">{configuration.dateLabel}</p>
        <h3 id={titleId} className="mm-workout-entry-title">
          {content.title}
        </h3>
        <p className="mm-workout-entry-result">{content.result}</p>
        <p className="mm-workout-entry-status">{content.status}</p>
        <div className="mm-workout-entry-action">
          {isSummary && configuration.href ? (
            <a
              {...linkProps}
              href={configuration.href}
              className={['mm-card-link', linkProps?.className]
                .filter(Boolean)
                .join(' ')}
            >
              {actionLabel}
            </a>
          ) : (
            <Button
              label={actionLabel}
              variant="secondary"
              disabled={!onAction}
              onClick={onAction}
            />
          )}
        </div>
      </div>
      <span className="sr-only" role="status" aria-atomic="true">
        {configuration.statusMessage}
      </span>
    </article>
  );
}
