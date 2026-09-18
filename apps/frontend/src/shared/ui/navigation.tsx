import type { ComponentProps, ReactNode } from 'react';
import type { NavigationConfiguration } from './generated/navigation';
import type { NavigationItemConfiguration } from './generated/navigationItem';
import { Icon } from './icon';

export function Navigation({
  label,
  brand = 'мой мир',
  children,
  className,
}: NavigationConfiguration & { children: ReactNode; className?: string }) {
  return (
    <nav
      aria-label={label}
      className={['mm-navigation', className].filter(Boolean).join(' ')}
    >
      <span className="mm-navigation-brand">{brand}</span>
      <div className="mm-navigation-items">{children}</div>
    </nav>
  );
}

// Native bindings let the shell supply its router handler without coupling shared UI to routes.
export function NavigationItem({
  label,
  icon,
  current = false,
  className,
  ...anchorProps
}: NavigationItemConfiguration &
  Omit<ComponentProps<'a'>, 'children' | 'aria-current' | 'aria-label'>) {
  return (
    <a
      {...anchorProps}
      className={['mm-navigation-item', className].filter(Boolean).join(' ')}
      aria-current={current ? 'page' : undefined}
    >
      <Icon name={icon} className="mm-navigation-icon" />
      <span className="mm-navigation-label">{label}</span>
    </a>
  );
}
