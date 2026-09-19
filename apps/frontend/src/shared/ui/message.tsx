import type { ComponentProps } from 'react';
import type { MessageConfiguration } from './generated/message';
import { Button } from './button';

const stateLabels = {
  incoming: '',
  sent: 'Отправлено',
  sending: 'Отправляем…',
  failed: 'Не отправлено',
} satisfies Record<MessageConfiguration['state'], string>;

// Retry and DOM bindings are technical props; delivery state stays owner-controlled.
export function Message({
  author,
  body,
  timeLabel,
  state,
  statusMessage,
  onRetry,
  className,
  ...articleProps
}: MessageConfiguration & {
  onRetry?: () => void;
} & Omit<
    ComponentProps<'article'>,
    keyof MessageConfiguration | 'children' | 'dangerouslySetInnerHTML'
  >) {
  const outgoing = state !== 'incoming';
  const visibleAuthor = outgoing ? 'Вы' : (author ?? 'Собеседник');
  const stateLabel = stateLabels[state];

  return (
    <article
      {...articleProps}
      className={['mm-message', className].filter(Boolean).join(' ')}
      data-direction={outgoing ? 'outgoing' : 'incoming'}
      data-state={state}
      aria-label={`Сообщение от ${visibleAuthor}`}
    >
      <strong className="mm-message-author">{visibleAuthor}</strong>
      <p className="mm-message-body">{body}</p>
      <p className="mm-message-meta">
        <time>{timeLabel}</time>
        {stateLabel && (
          <>
            <span aria-hidden="true"> · </span>
            <span
              className={state === 'failed' ? 'mm-message-error' : undefined}
            >
              {stateLabel}
            </span>
          </>
        )}
      </p>
      {state === 'failed' && (
        <Button
          label="Повторить"
          variant="secondary"
          disabled={!onRetry}
          onClick={onRetry}
        />
      )}
      <span className="sr-only" role="status" aria-atomic="true">
        {statusMessage}
      </span>
    </article>
  );
}
