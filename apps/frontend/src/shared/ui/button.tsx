import type { ComponentPropsWithRef } from 'react';
import type { ButtonConfiguration } from './generated/button';
import type { IconButtonConfiguration } from './generated/iconButton';
import { Icon } from './icon';

// DOM attributes, refs and event handlers are technical bindings, not data models.
type NativeButtonProps = Omit<
  ComponentPropsWithRef<'button'>,
  | keyof ButtonConfiguration
  | 'children'
  | 'dangerouslySetInnerHTML'
  | 'aria-busy'
  | 'aria-disabled'
>;

type ButtonProps = ButtonConfiguration & NativeButtonProps;
type IconButtonProps = IconButtonConfiguration &
  Omit<NativeButtonProps, 'aria-label' | 'aria-labelledby'>;

function ButtonFrame({
  size = 'm',
  variant = 'primary',
  disabled = false,
  loading = false,
  type = 'button',
  className,
  ...props
}: Pick<ButtonConfiguration, 'size' | 'variant' | 'disabled' | 'loading'> &
  ComponentPropsWithRef<'button'>) {
  return (
    <button
      {...props}
      type={type}
      className={['mm-button', className].filter(Boolean).join(' ')}
      data-size={size}
      data-variant={variant}
      disabled={disabled || loading}
      aria-busy={loading}
    />
  );
}

export function Button({
  label,
  loading = false,
  loadingLabel = 'Подождите…',
  leadingIcon,
  trailingIcon,
  ...props
}: ButtonProps) {
  return (
    <ButtonFrame {...props} loading={loading}>
      {leadingIcon && <Icon name={leadingIcon} size="s" />}
      <span className="mm-button-label">{loading ? loadingLabel : label}</span>
      {trailingIcon && <Icon name={trailingIcon} size="s" />}
    </ButtonFrame>
  );
}

export function IconButton({
  label,
  icon,
  loading = false,
  className,
  ...props
}: IconButtonProps) {
  return (
    <ButtonFrame
      {...props}
      loading={loading}
      aria-label={label}
      className={['mm-icon-button', className].filter(Boolean).join(' ')}
    >
      {loading ? (
        <span className="mm-button-loading" aria-hidden="true" />
      ) : (
        <Icon name={icon} size="s" />
      )}
    </ButtonFrame>
  );
}
