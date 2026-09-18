import type { ComponentPropsWithRef } from 'react';
import type { SelectionConfiguration } from './generated/selection';
import { Icon } from './icon';

// Only DOM bindings and the value callback are handwritten; data comes from the schema.
type SelectionProps = Omit<SelectionConfiguration, 'kind'> &
  Omit<
    ComponentPropsWithRef<'input'>,
    | keyof SelectionConfiguration
    | 'type'
    | 'role'
    | 'aria-checked'
    | 'defaultChecked'
    | 'onChange'
    | 'children'
  > & {
    onCheckedChange: (checked: boolean) => void;
  };

function Selection({
  kind,
  label,
  checked,
  disabled = false,
  onCheckedChange,
  className,
  ...inputProps
}: SelectionProps & Pick<SelectionConfiguration, 'kind'>) {
  return (
    <label
      className={['mm-selection', className].filter(Boolean).join(' ')}
      data-kind={kind}
    >
      <input
        {...inputProps}
        className="mm-selection-input"
        type={kind === 'radio' ? 'radio' : 'checkbox'}
        role={kind === 'switch' ? 'switch' : undefined}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onCheckedChange(event.currentTarget.checked)}
      />
      <span className="mm-selection-indicator" aria-hidden="true">
        {kind === 'checkbox' && <Icon name="check" />}
      </span>
      <span className="mm-selection-label">{label}</span>
    </label>
  );
}

export function Checkbox(props: SelectionProps) {
  return <Selection {...props} kind="checkbox" />;
}

export function Radio(props: SelectionProps) {
  return <Selection {...props} kind="radio" />;
}

export function Switch(props: SelectionProps) {
  return <Selection {...props} kind="switch" />;
}
