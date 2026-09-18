import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox, Radio, Switch } from './index';

describe.each([
  ['checkbox', Checkbox],
  ['radio', Radio],
  ['switch', Switch],
] as const)('%s', (role, Component) => {
  it('labels the native input and requests a change without owning its value', () => {
    const onCheckedChange = vi.fn();
    const { rerender } = render(
      <Component
        label="Выбрать"
        checked={false}
        onCheckedChange={onCheckedChange}
      />,
    );
    const input = screen.getByRole(role, { name: 'Выбрать' });
    expect(input).toBeInstanceOf(HTMLInputElement);
    expect(input).not.toBeChecked();
    fireEvent.click(screen.getByText('Выбрать'));
    expect(onCheckedChange).toHaveBeenCalledExactlyOnceWith(true);
    expect(input).not.toBeChecked();
    rerender(
      <Component label="Выбрать" checked onCheckedChange={onCheckedChange} />,
    );
    expect(input).toBeChecked();
  });

  it.each([false, true])('preserves checked=%s while disabled', (checked) => {
    const onCheckedChange = vi.fn();
    render(
      <Component
        label="Недоступно"
        checked={checked}
        disabled
        onCheckedChange={onCheckedChange}
      />,
    );
    const input = screen.getByRole(role, { name: 'Недоступно' });
    expect(input).toBeDisabled();
    expect(input).toHaveProperty('checked', checked);
    fireEvent.click(screen.getByText('Недоступно'));
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(input).toHaveProperty('checked', checked);
  });

  it('forwards native form attributes, description and ref to the input', () => {
    const ref = createRef<HTMLInputElement>();
    const onFocus = vi.fn();
    render(
      <form aria-label="Настройки">
        <p id="hint">Можно изменить позднее</p>
        <Component
          id="choice"
          name="choice"
          value="yes"
          label="Выбрать"
          checked
          disabled={false}
          required
          aria-describedby="hint"
          className="custom-selection"
          ref={ref}
          onFocus={onFocus}
          onCheckedChange={vi.fn()}
        />
      </form>,
    );
    const input = screen.getByRole(role);
    expect(input).toHaveAccessibleDescription('Можно изменить позднее');
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('id', 'choice');
    expect(input.closest('label')).toHaveClass('custom-selection');
    expect(ref.current).toBe(input);
    fireEvent.focus(input);
    expect(onFocus).toHaveBeenCalledOnce();
    expect(new FormData(screen.getByRole('form')).get('choice')).toBe('yes');
  });
});

it.each([Checkbox, Switch])(
  'allows a checked toggle to request false',
  (Component) => {
    const onCheckedChange = vi.fn();
    render(
      <Component label="Включено" checked onCheckedChange={onCheckedChange} />,
    );
    fireEvent.click(screen.getByLabelText('Включено'));
    expect(onCheckedChange).toHaveBeenCalledExactlyOnceWith(false);
  },
);

it('does not deselect or emit again when clicking the selected radio', () => {
  const onCheckedChange = vi.fn();
  render(<Radio label="Друзья" checked onCheckedChange={onCheckedChange} />);
  fireEvent.click(screen.getByRole('radio'));
  expect(screen.getByRole('radio')).toBeChecked();
  expect(onCheckedChange).not.toHaveBeenCalled();
});
