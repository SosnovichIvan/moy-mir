import { type ReactNode } from 'react';
import type { InfoBannerConfiguration } from './generated/infoBanner';

export function InfoBanner({
  title,
  body,
  state,
  size = 's',
  announcement = 'off',
  action,
  className,
}: InfoBannerConfiguration & { action?: ReactNode; className?: string }) {
  return (
    <section
      className={['mm-info-banner', className].filter(Boolean).join(' ')}
      data-state={state}
      data-size={size}
    >
      <h2 className="mm-info-banner-title">{title}</h2>
      <p className="mm-info-banner-body">{body}</p>
      {state !== 'loading' && action}
      <span className="sr-only" aria-live={announcement} aria-atomic="true">
        {announcement !== 'off' && `${title}. ${body}`}
      </span>
    </section>
  );
}
