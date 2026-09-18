import { useState, type ReactNode } from 'react';
import type { AvatarConfiguration } from './generated/avatar';
import { Icon } from './icon';

function initials(name: string) {
  if (!name) return '';
  const words = name.split(/\s+/u);
  const selected = words.length === 1 ? words : [words[0]!, words.at(-1)!];
  const segmenter = new Intl.Segmenter('ru', { granularity: 'grapheme' });
  return selected
    .map((word) => [...segmenter.segment(word)][0]!.segment)
    .join('')
    .toLocaleUpperCase('ru');
}

// A URL owns its loading lifecycle: changing it mounts a fresh image and ignores old events.
function AvatarImage({ src, fallback }: { src: string; fallback: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <>
      {!loaded && fallback}
      {!failed && (
        <img
          src={src}
          alt=""
          aria-hidden="true"
          className="mm-avatar-image"
          data-loaded={loaded}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setFailed(true);
            setLoaded(false);
          }}
        />
      )}
    </>
  );
}

export function Avatar({
  name,
  src,
  size = 48,
  decorative = false,
  className,
}: AvatarConfiguration & { className?: string }) {
  const displayName = name.trim().replace(/\s+/gu, ' ');
  const letters = initials(displayName);
  const fallback = (
    <span className="mm-avatar-fallback" aria-hidden="true">
      {letters || <Icon name="user" />}
    </span>
  );
  const imageSource = src?.trim();
  return (
    <span
      className={['mm-avatar', className].filter(Boolean).join(' ')}
      data-size={size}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : displayName || 'Пользователь'}
      aria-hidden={decorative || undefined}
    >
      {imageSource ? (
        <AvatarImage key={imageSource} src={imageSource} fallback={fallback} />
      ) : (
        fallback
      )}
    </span>
  );
}
