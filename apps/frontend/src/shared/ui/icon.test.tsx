import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Icon } from './index';
import schema from '../../../../../openApi/frontend/ui.schema.json';
import type { IconName } from './generated/contracts';

describe('Icon', () => {
  it.each(schema.definitions.IconName.enum)(
    'renders the exported %s asset decoratively',
    (name) => {
      const { container } = render(<Icon name={name as IconName} />);
      const icon = container.firstElementChild;
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon).toHaveAttribute('data-size', 'm');
      expect(icon?.getAttribute('style')).toContain('data:image/svg+xml');
    },
  );
  it('allows size and inherited color without adding a second accessible name', () => {
    const { container, getByRole } = render(
      <button aria-label="Добавить друга">
        <Icon name="plus" size="s" className="text-accent" />
      </button>,
    );
    expect(getByRole('button', { name: 'Добавить друга' })).toBeVisible();
    expect(container.querySelector('span')).toHaveClass(
      'mm-icon',
      'text-accent',
    );
    expect(container.querySelector('span')).toHaveAttribute('data-size', 's');
  });
});
