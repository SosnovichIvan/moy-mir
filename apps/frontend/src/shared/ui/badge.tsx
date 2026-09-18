import type { BadgeConfiguration } from './generated/badge';
import type { CountBadgeConfiguration } from './generated/countBadge';
import { Icon } from './icon';

export function Badge({
  label,
  tone = 'neutral',
  leadingIcon,
  trailingIcon,
  className,
}: BadgeConfiguration & { className?: string }) {
  return (
    <span
      className={['mm-badge', className].filter(Boolean).join(' ')}
      data-tone={tone}
    >
      {leadingIcon && <Icon name={leadingIcon} size="s" />}
      <span className="mm-badge-label">{label}</span>
      {trailingIcon && <Icon name={trailingIcon} size="s" />}
    </span>
  );
}

export function CountBadge({
  count,
  label,
  className,
}: CountBadgeConfiguration & { className?: string }) {
  if (!Number.isSafeInteger(count) || count < 0)
    throw new RangeError(
      'CountBadge count must be a non-negative safe integer',
    );
  return (
    <span
      className={['mm-count-badge', className].filter(Boolean).join(' ')}
      data-wide={count > 9}
    >
      <span aria-hidden="true">{count > 99 ? '99+' : count}</span>
      <span className="sr-only">
        {label}: {count}
      </span>
    </span>
  );
}
