import type { CSSProperties } from 'react';
import type { ControlSize, IconName } from './generated/contracts';
import plus from './assets/plus.svg';
import arrow from './assets/arrow.svg';
import close from './assets/close.svg';
import eye from './assets/eye.svg';
import eyeOff from './assets/eyeOff.svg';
import check from './assets/check.svg';
import users from './assets/users.svg';
import user from './assets/user.svg';
import inbox from './assets/inbox.svg';

const sources = {
  plus,
  arrow,
  close,
  eye,
  eyeOff,
  check,
  users,
  user,
  inbox,
} satisfies Record<IconName, string>;

// DOM styling props are technical React bindings; serializable choices are generated.
export function Icon({
  name,
  size = 'm',
  className,
}: {
  name: IconName;
  size?: ControlSize;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={['mm-icon', className].filter(Boolean).join(' ')}
      data-size={size}
      style={{ '--mm-icon-source': `url("${sources[name]}")` } as CSSProperties}
    />
  );
}
