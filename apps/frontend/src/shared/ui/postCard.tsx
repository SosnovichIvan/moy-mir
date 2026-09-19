import { useId } from 'react';
import type { PostCardConfiguration } from './generated/postCard';
import { Button } from './button';

export function PostCard({
  author,
  publishedLabel,
  audience,
  body,
  reactionCount,
  liked,
  loading = false,
  error,
  statusMessage,
  onReaction,
  className,
}: PostCardConfiguration & {
  onReaction?: () => void;
  className?: string;
}) {
  const titleId = useId();
  const errorId = useId();

  return (
    <article
      className={['mm-post-card', className].filter(Boolean).join(' ')}
      data-liked={liked}
      aria-labelledby={titleId}
    >
      <h3 id={titleId} className="mm-post-card-author">
        {author}
      </h3>
      <p className="mm-post-card-meta">
        {publishedLabel} · {audience}
      </p>
      <p className="mm-post-card-body">{body}</p>
      <Button
        label={`Нравится · ${reactionCount}`}
        loadingLabel="Изменяем реакцию…"
        variant="secondary"
        loading={loading}
        disabled={!onReaction}
        aria-pressed={liked}
        aria-describedby={error ? errorId : undefined}
        onClick={onReaction}
      />
      <p id={errorId} className="mm-card-error" role="alert">
        {error}
      </p>
      <span className="sr-only" role="status" aria-atomic="true">
        {loading ? 'Изменяем реакцию…' : statusMessage}
      </span>
    </article>
  );
}
