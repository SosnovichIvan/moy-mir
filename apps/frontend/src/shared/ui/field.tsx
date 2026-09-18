import {
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';
import type { FieldConfiguration } from './generated/field';
import { Icon } from './icon';

type CommonConfiguration = Omit<
  FieldConfiguration,
  'options' | 'type' | 'clearable'
>;
// Native DOM attributes, refs and callbacks are technical bindings, not data models.
type NativeProps<T extends 'input' | 'textarea' | 'select'> = Omit<
  ComponentPropsWithRef<T>,
  | keyof FieldConfiguration
  | 'defaultValue'
  | 'onChange'
  | 'children'
  | 'dangerouslySetInnerHTML'
  | 'aria-invalid'
  | 'aria-label'
  | 'aria-labelledby'
> & { onValueChange: (value: string) => void };

type FrameProps = {
  [K in keyof CommonConfiguration]: CommonConfiguration[K] | undefined;
} & {
  id: string;
  className?: string | undefined;
  children: ReactNode;
};

function FieldFrame({
  id,
  label,
  helper,
  error,
  size = 'm',
  disabled = false,
  readOnly = false,
  className,
  children,
}: FrameProps) {
  return (
    <div
      className={['mm-field', className].filter(Boolean).join(' ')}
      data-size={size}
      data-disabled={disabled}
      data-readonly={readOnly}
      data-error={Boolean(error)}
    >
      <label className="mm-field-label" htmlFor={id}>
        {label}
      </label>
      {children}
      {(error || helper) && (
        <p id={`${id}-description`} className="mm-field-description">
          {error || helper}
        </p>
      )}
    </div>
  );
}

function useFieldBinding(
  id: string | undefined,
  description: string | undefined,
  error: string | undefined,
  helper: string | undefined,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return {
    id: fieldId,
    'aria-invalid': Boolean(error),
    'aria-describedby':
      [description, (error || helper) && `${fieldId}-description`]
        .filter(Boolean)
        .join(' ') || undefined,
  };
}

export function TextField({
  label,
  value,
  helper,
  error,
  size,
  disabled,
  readOnly,
  className,
  type = 'text',
  clearable = true,
  onValueChange,
  ref,
  id,
  'aria-describedby': description,
  ...nativeProps
}: Omit<FieldConfiguration, 'options'> & NativeProps<'input'>) {
  const binding = useFieldBinding(id, description, error, helper);
  const inputRef = useRef<HTMLInputElement>(null);
  const selection = useRef<Pick<
    HTMLInputElement,
    'selectionStart' | 'selectionEnd'
  > | null>(null);
  const [revealed, setRevealed] = useState(false);
  useImperativeHandle(ref, () => inputRef.current!, []);
  useLayoutEffect(() => {
    if (selection.current) {
      const input = inputRef.current!;
      input.focus();
      input.setSelectionRange(
        selection.current.selectionStart,
        selection.current.selectionEnd,
      );
      selection.current = null;
    }
  }, [revealed]);
  return (
    <FieldFrame
      {...{
        ...binding,
        label,
        value,
        helper,
        error,
        size,
        disabled,
        readOnly,
        className,
      }}
    >
      <div className="mm-field-control">
        <input
          {...nativeProps}
          {...binding}
          ref={inputRef}
          className="mm-field-input"
          type={type === 'password' && revealed ? 'text' : type}
          value={value}
          disabled={disabled}
          readOnly={readOnly}
          onChange={(event) => onValueChange(event.currentTarget.value)}
        />
        {!disabled &&
          !readOnly &&
          (type === 'password' ? (
            <button
              type="button"
              className="mm-field-action"
              aria-controls={binding.id}
              aria-label={revealed ? 'Скрыть пароль' : 'Показать пароль'}
              onClick={() => {
                const input = inputRef.current!;
                selection.current = {
                  selectionStart: input.selectionStart,
                  selectionEnd: input.selectionEnd,
                };
                setRevealed(!revealed);
              }}
            >
              <Icon name={revealed ? 'eyeOff' : 'eye'} size="s" />
            </button>
          ) : (
            clearable &&
            value !== '' && (
              <button
                type="button"
                className="mm-field-action"
                aria-label={`Очистить поле «${label}»`}
                aria-controls={binding.id}
                onClick={() => {
                  onValueChange('');
                  inputRef.current!.focus();
                }}
              >
                <Icon name="close" size="s" />
              </button>
            )
          ))}
      </div>
    </FieldFrame>
  );
}

export function TextareaField({
  label,
  value,
  helper,
  error,
  size,
  disabled,
  readOnly,
  className,
  onValueChange,
  id,
  'aria-describedby': description,
  ...nativeProps
}: CommonConfiguration & NativeProps<'textarea'>) {
  const binding = useFieldBinding(id, description, error, helper);
  return (
    <FieldFrame
      {...{
        ...binding,
        label,
        value,
        helper,
        error,
        size,
        disabled,
        readOnly,
        className,
      }}
    >
      <div className="mm-field-control mm-field-multiline">
        <textarea
          {...nativeProps}
          {...binding}
          className="mm-field-input"
          value={value}
          disabled={disabled}
          readOnly={readOnly}
          onChange={(event) => onValueChange(event.currentTarget.value)}
        />
      </div>
    </FieldFrame>
  );
}

export function SelectField({
  label,
  value,
  helper,
  error,
  size,
  disabled,
  readOnly,
  className,
  placeholder,
  options,
  onValueChange,
  id,
  'aria-describedby': description,
  ...nativeProps
}: CommonConfiguration &
  Required<Pick<FieldConfiguration, 'options'>> &
  Omit<NativeProps<'select'>, 'multiple'>) {
  const binding = useFieldBinding(id, description, error, helper);
  return (
    <FieldFrame
      {...{
        ...binding,
        label,
        value,
        helper,
        error,
        size,
        disabled,
        readOnly,
        className,
      }}
    >
      {readOnly ? (
        <div className="mm-field-control mm-field-static">
          <output {...binding}>
            {options.find((option) => option.value === value)?.label ?? value}
          </output>
          <input
            type="hidden"
            name={nativeProps.name}
            value={value}
            disabled={disabled}
            form={nativeProps.form}
          />
        </div>
      ) : (
        <div
          className="mm-field-control mm-field-select"
          data-empty={value === ''}
        >
          <select
            {...nativeProps}
            {...binding}
            className="mm-field-input"
            value={value}
            disabled={disabled}
            onChange={(event) => onValueChange(event.currentTarget.value)}
          >
            {placeholder !== undefined && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <Icon name="arrow" size="s" className="mm-field-expand" />
        </div>
      )}
    </FieldFrame>
  );
}
