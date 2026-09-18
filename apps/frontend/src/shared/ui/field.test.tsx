import { createRef, useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TextField, TextareaField, SelectField } from './index';

describe.each([
  ['input', TextField],
  ['textarea', TextareaField],
] as const)('%s field', (_, Component) => {
  it('uses a visible label, unique id and controlled value', () => {
    const change = vi.fn();
    const { rerender } = render(
      <Component label="Имя" value="Анна" onValueChange={change} />,
    );
    const input = screen.getByRole('textbox', { name: 'Имя' });
    expect(input).toHaveValue('Анна');
    expect(input).not.toHaveAttribute('aria-describedby');
    fireEvent.change(input, { target: { value: 'Иван' } });
    expect(change).toHaveBeenCalledExactlyOnceWith('Иван');
    expect(input).toHaveValue('Анна');
    rerender(<Component label="Имя" value="Иван" onValueChange={change} />);
    expect(input).toHaveValue('Иван');
  });

  it('connects helper/error and external descriptions without discarding the value', () => {
    const change = vi.fn();
    const { rerender } = render(
      <>
        <p id="external">Внешняя подсказка</p>
        <Component
          id="field"
          label="Имя"
          value="Анна"
          helper="Подсказка"
          aria-describedby="external"
          onValueChange={change}
        />
      </>,
    );
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription(
      'Внешняя подсказка Подсказка',
    );
    rerender(
      <Component
        id="field"
        label="Имя"
        value="Анна"
        helper="Подсказка"
        error="Исправьте имя"
        onValueChange={change}
      />,
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription(
      'Исправьте имя',
    );
    expect(screen.queryByText('Подсказка')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('Анна');
  });

  it('preserves form attributes and distinguishes readonly from disabled', () => {
    const { rerender } = render(
      <form aria-label="Форма">
        <Component
          id="name"
          name="name"
          label="Имя"
          value="Анна"
          readOnly
          required
          className="custom"
          size="s"
          onValueChange={vi.fn()}
        />
      </form>,
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    expect(screen.getByRole('textbox')).toBeEnabled();
    expect(screen.getByRole('textbox')).toBeRequired();
    expect(screen.getByRole('textbox').closest('.mm-field')).toHaveClass(
      'custom',
    );
    expect(new FormData(screen.getByRole('form')).get('name')).toBe('Анна');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    rerender(
      <form aria-label="Форма">
        <Component
          name="name"
          label="Имя"
          value="Анна"
          disabled
          size="l"
          onValueChange={vi.fn()}
        />
      </form>,
    );
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(new FormData(screen.getByRole('form')).has('name')).toBe(false);
  });
});

it('clears only nonempty editable values and restores focus without submitting', () => {
  const submit = vi.fn();
  function Example() {
    const [value, setValue] = useState('Анна');
    return (
      <form onSubmit={submit}>
        <TextField label="Имя" value={value} onValueChange={setValue} />
      </form>
    );
  }
  render(<Example />);
  fireEvent.click(screen.getByRole('button', { name: 'Очистить поле «Имя»' }));
  expect(screen.getByRole('textbox')).toHaveValue('');
  expect(screen.getByRole('textbox')).toHaveFocus();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  expect(submit).not.toHaveBeenCalled();
});

it('allows consumers to suppress clear and forwards an input ref', () => {
  const ref = createRef<HTMLInputElement>();
  render(
    <TextField
      label="Поиск"
      type="search"
      value="Анна"
      clearable={false}
      ref={ref}
      onValueChange={vi.fn()}
    />,
  );
  expect(ref.current).toBe(screen.getByRole('searchbox'));
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

it('toggles password visibility, preserving value and selection in both directions', () => {
  const change = vi.fn();
  render(
    <TextField
      label="Пароль"
      type="password"
      value="secret"
      onValueChange={change}
    />,
  );
  const input = screen.getByLabelText('Пароль') as HTMLInputElement;
  expect(input).not.toHaveFocus();
  input.focus();
  input.setSelectionRange(1, 4);
  fireEvent.click(screen.getByRole('button', { name: 'Показать пароль' }));
  expect(input).toHaveAttribute('type', 'text');
  expect(input).toHaveFocus();
  expect([input.selectionStart, input.selectionEnd]).toEqual([1, 4]);
  fireEvent.click(screen.getByRole('button', { name: 'Скрыть пароль' }));
  expect(input).toHaveAttribute('type', 'password');
  expect(input).toHaveValue('secret');
  expect([input.selectionStart, input.selectionEnd]).toEqual([1, 4]);
  expect(change).not.toHaveBeenCalled();
});

it('forwards a textarea ref and keeps independent ids', () => {
  const ref = createRef<HTMLTextAreaElement>();
  render(
    <>
      <TextareaField
        ref={ref}
        label="Описание"
        value=""
        onValueChange={vi.fn()}
      />
      <TextField label="Имя" value="" onValueChange={vi.fn()} />
    </>,
  );
  expect(ref.current).toBe(screen.getByLabelText('Описание'));
  expect(ref.current!.id).not.toBe(screen.getByLabelText('Имя').id);
});

const options = [
  { value: 'friends', label: 'Друзья' },
  { value: 'all', label: 'Все' },
  { value: 'closed', label: 'Закрыто', disabled: true },
];

it('uses a native controlled select with placeholder, disabled options and ref', () => {
  const change = vi.fn();
  const ref = createRef<HTMLSelectElement>();
  const { rerender } = render(
    <SelectField
      label="Видимость"
      value=""
      options={options}
      placeholder="Выберите"
      ref={ref}
      onValueChange={change}
    />,
  );
  const select = screen.getByRole('combobox');
  expect(ref.current).toBe(select);
  expect(select).toHaveValue('');
  expect(screen.getByRole('option', { name: 'Закрыто' })).toBeDisabled();
  fireEvent.change(select, { target: { value: 'all' } });
  expect(change).toHaveBeenCalledExactlyOnceWith('all');
  expect(select).toHaveValue('');
  rerender(
    <SelectField
      label="Видимость"
      value="all"
      options={options}
      onValueChange={change}
      helper="Подсказка"
    />,
  );
  expect(select).toHaveValue('all');
  expect(
    screen.queryByRole('option', { name: 'Выберите' }),
  ).not.toBeInTheDocument();
  expect(select).toHaveAccessibleDescription('Подсказка');
});

it('preserves readonly select submission and exposes a labelled static value', () => {
  const props = {
    label: 'Видимость',
    value: 'friends',
    options,
    onValueChange: vi.fn(),
    readOnly: true,
    name: 'visibility',
  };
  const { rerender } = render(
    <form aria-label="Форма">
      <SelectField {...props} />
    </form>,
  );
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  expect(screen.getByLabelText('Видимость')).toHaveTextContent('Друзья');
  expect(new FormData(screen.getByRole('form')).get('visibility')).toBe(
    'friends',
  );
  rerender(
    <form aria-label="Форма">
      <SelectField {...props} value="unknown" disabled error="Недоступно" />
    </form>,
  );
  expect(screen.getByLabelText('Видимость')).toHaveTextContent('unknown');
  expect(screen.getByLabelText('Видимость')).toHaveAccessibleDescription(
    'Недоступно',
  );
  expect(new FormData(screen.getByRole('form')).has('visibility')).toBe(false);
});
