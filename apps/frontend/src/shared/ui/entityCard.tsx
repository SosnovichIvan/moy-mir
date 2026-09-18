import { useId, useLayoutEffect, useRef, type ComponentProps } from 'react';
import type {
  EntityCardAction,
  EntityCardConfiguration,
} from './generated/entityCard';
import { Avatar } from './avatar';
import { Button } from './button';

const actions = {
  new: ['add'],
  pending: ['cancel'],
  incoming: ['accept', 'decline'],
  blocked: ['unblock'],
  friend: [],
  member: [],
} as const satisfies Record<
  EntityCardConfiguration['state'],
  readonly EntityCardAction[]
>;

const labels = {
  add: 'Добавить в друзья',
  cancel: 'Отменить заявку',
  accept: 'Принять',
  decline: 'Отклонить',
  unblock: 'Разблокировать',
} satisfies Record<EntityCardAction, string>;

// Callbacks and native link bindings are technical props, not serialized models.
export function EntityCard({
  name,
  detail,
  avatarSrc,
  state,
  href,
  loadingAction,
  error,
  statusMessage,
  onAction,
  linkProps,
  className,
}: EntityCardConfiguration & {
  onAction?: (action: EntityCardAction) => void;
  linkProps?: Omit<
    ComponentProps<'a'>,
    'href' | 'children' | 'dangerouslySetInnerHTML'
  >;
  className?: string;
}) {
  const id = useId();
  const card = useRef<HTMLElement>(null);
  const focusedControl = useRef<HTMLElement | null>(null);
  const busy = Boolean(loadingAction);

  // Keep focus local when a focused action is disabled or replaced by its result.
  // A user who tabs/clicks elsewhere must never have focus pulled back.
  useLayoutEffect(() => {
    const root = card.current!;
    const previous = focusedControl.current;
    const active = root.ownerDocument.activeElement;
    if (
      !previous ||
      (active !== root.ownerDocument.body && !root.contains(active))
    )
      return;
    if (busy) {
      root.focus();
    } else if (active === root || !previous.isConnected) {
      const target =
        previous.isConnected && !previous.matches(':disabled')
          ? previous
          : root.querySelector<HTMLElement>('button:enabled, a[href]');
      (target ?? root).focus();
    }
  }, [busy, state]);

  return (
    <article
      ref={card}
      className={['mm-entity-card', className].filter(Boolean).join(' ')}
      aria-labelledby={`${id}-title`}
      tabIndex={-1}
      data-state={state}
      onFocusCapture={(event) => {
        if (event.target !== event.currentTarget)
          focusedControl.current = event.target;
      }}
      onBlurCapture={(event) => {
        if (
          !event.currentTarget.contains(event.relatedTarget) &&
          (event.relatedTarget ||
            (event.target.isConnected && !event.target.matches(':disabled')))
        ) {
          focusedControl.current = null;
        }
      }}
    >
      <div className="mm-entity-card-content">
        <div className="mm-entity-card-identity">
          <Avatar
            name={name}
            {...(avatarSrc ? { src: avatarSrc } : {})}
            decorative
          />
          <div className="mm-entity-card-info">
            <h3 id={`${id}-title`} className="mm-entity-card-title">
              {name}
            </h3>
            {detail && <p className="mm-entity-card-detail">{detail}</p>}
          </div>
        </div>
        <div className="mm-entity-card-actions" aria-busy={busy}>
          {actions[state].map((action) => (
            <Button
              key={action}
              label={labels[action]}
              loadingLabel={labels[action]}
              variant={action === 'accept' ? 'primary' : 'secondary'}
              loading={loadingAction === action}
              disabled={busy || !onAction}
              aria-describedby={error ? `${id}-error` : undefined}
              onClick={() => onAction!(action)}
            />
          ))}
          {(state === 'friend' || state === 'member') && (
            <a
              {...linkProps}
              href={href}
              className={['mm-entity-card-link', linkProps?.className]
                .filter(Boolean)
                .join(' ')}
            >
              {state === 'friend' ? 'Открыть профиль' : 'Открыть группу'}
            </a>
          )}
        </div>
      </div>
      <p id={`${id}-error`} className="mm-entity-card-error" role="alert">
        {error}
      </p>
      <span className="sr-only" role="status" aria-atomic="true">
        {busy ? `Выполняется: ${labels[loadingAction!]}` : statusMessage}
      </span>
    </article>
  );
}
