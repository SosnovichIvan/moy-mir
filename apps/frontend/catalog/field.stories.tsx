import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  TextField,
  TextareaField,
  SelectField,
  Button,
  type ControlSize,
} from '../src/shared/ui';

const options = [
  { value: 'friends', label: 'Только друзья' },
  { value: 'all', label: 'Все пользователи' },
  { value: 'closed', label: 'Закрыто', disabled: true },
];

function FieldExamples({ size }: { size: ControlSize }) {
  const [name, setName] = useState('ivan@example.ru');
  const [search, setSearch] = useState('Александр');
  const [password, setPassword] = useState('Example password');
  const [description, setDescription] = useState(
    'Встречаемся в парке.\nВозьмите воду и удобную обувь.',
  );
  const [visibility, setVisibility] = useState('friends');
  return (
    <section
      aria-label={`Размер ${size.toUpperCase()}`}
      className="grid min-w-0 content-start gap-6"
    >
      <h2 className="text-title">{size.toUpperCase()}</h2>
      <TextField
        label="Электронная почта"
        type="email"
        size={size}
        value={name}
        onValueChange={setName}
        helper="Введите адрес электронной почты"
        autoComplete="email"
      />
      <TextField
        label="Найти друга"
        type="search"
        size={size}
        value={search}
        onValueChange={setSearch}
        placeholder="Имя или ник"
        helper="Поиск по имени или нику"
      />
      <TextField
        label="Пароль"
        type="password"
        size={size}
        value={password}
        onValueChange={setPassword}
        helper="Не сообщайте пароль другим людям"
        autoComplete="new-password"
      />
      <SelectField
        label="Видимость"
        size={size}
        value={visibility}
        onValueChange={setVisibility}
        options={options}
        placeholder="Выберите вариант"
        helper="Кто сможет видеть запись"
      />
      <TextareaField
        label="Описание"
        size={size}
        value={description}
        onValueChange={setDescription}
        helper="Расскажите участникам о планах"
      />
      <TextField
        label="Недоступное поле"
        size={size}
        value="ivan@example.ru"
        onValueChange={setName}
        disabled
        helper="Поле недоступно"
      />
      <TextField
        label="Только просмотр"
        size={size}
        value="ivan@example.ru"
        onValueChange={setName}
        readOnly
        helper="Можно выделить и скопировать"
      />
      <SelectField
        label="Видимость для просмотра"
        size={size}
        value="friends"
        onValueChange={setVisibility}
        options={options}
        readOnly
        helper="Только просмотр"
      />
    </section>
  );
}

function FieldShowcase() {
  const [value, setValue] = useState('');
  const [password, setPassword] = useState('Example password');
  const [selection, setSelection] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  return (
    <main className="mx-auto grid max-w-[1440px] gap-8 p-4 [overflow-wrap:anywhere] md:p-6 lg:p-8">
      <header className="grid gap-2">
        <h1 className="text-heading">Поля ввода</h1>
        <p className="text-muted">
          S · 44 px / M · 48 px / L · 56 px. Очистка и показ пароля · 44×44 px.
          Фокус и наведение проверяются взаимодействием.
        </p>
      </header>
      <form
        aria-label="Попробовать поля"
        noValidate
        className="grid max-w-[448px] gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
        }}
      >
        <h2 className="text-title">Попробовать поля</h2>
        <TextField
          label="Ваше имя"
          name="name"
          value={value}
          onValueChange={setValue}
          placeholder="Введите имя"
          helper="Как к вам обращаться"
          error={submitted && !value ? 'Введите имя, чтобы продолжить' : ''}
          required
          autoComplete="name"
        />
        <TextField
          label="Ваш пароль"
          name="password"
          type="password"
          value={password}
          onValueChange={setPassword}
          autoComplete="new-password"
        />
        <SelectField
          label="Кто увидит запись"
          value={selection}
          onValueChange={setSelection}
          options={options}
          placeholder="Выберите вариант"
        />
        <TextareaField
          label="Ваши планы"
          value={description}
          onValueChange={setDescription}
          placeholder="Расскажите о планах"
        />
        <Button label="Проверить имя" type="submit" />
        <output aria-label="Результат проверки">
          {submitted
            ? value
              ? 'Имя заполнено'
              : 'Нужно заполнить имя'
            : 'Проверка не запускалась'}
        </output>
      </form>
      <div className="grid items-start gap-8 md:grid-cols-3">
        {(['s', 'm', 'l'] as const).map((size) => (
          <FieldExamples key={size} size={size} />
        ))}
      </div>
      <section
        aria-label="Ошибки и ограничения"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <TextField
          label="Очень длинная подпись поля для проверки переноса"
          value={value}
          onValueChange={setValue}
          error="Проверьте введённое значение и исправьте ошибку, чтобы продолжить."
          size="s"
        />
        <TextField
          label="Пароль с ошибкой"
          type="password"
          value={password}
          onValueChange={setPassword}
          error="Пароль не подходит. Проверьте его"
        />
        <TextField
          label="Поиск с ошибкой"
          type="search"
          value={value}
          onValueChange={setValue}
          error="Проверьте имя или ник и повторите поиск"
        />
        <SelectField
          label="Выбор с ошибкой"
          value={selection}
          onValueChange={setSelection}
          options={options}
          placeholder="Выберите вариант"
          error="Выберите вариант видимости"
        />
        <TextareaField
          label="Описание с ошибкой"
          value={description}
          onValueChange={setDescription}
          error="Добавьте описание события"
        />
        <SelectField
          label="Недоступный выбор"
          value="friends"
          onValueChange={setSelection}
          options={options}
          disabled
        />
        <TextareaField
          label="Недоступное описание"
          value="Текст недоступен"
          onValueChange={setDescription}
          disabled
        />
        <TextareaField
          label="Описание для просмотра"
          value="Текст можно скопировать"
          onValueChange={setDescription}
          readOnly
        />
        <TextField
          label="Недоступный пароль"
          type="password"
          value="secret"
          onValueChange={setPassword}
          disabled
        />
      </section>
    </main>
  );
}
const meta = {
  id: 'field',
  title: 'Компоненты/Field',
  component: FieldShowcase,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'TextField (text/email/tel/url/search/password), TextareaField, SelectField. Обязательные label, value, onValueChange; для SelectField — options. size s/m/l, helper, error, disabled, readOnly. Native DOM props и ref передаются контролу; className — обёртке. Значение управляется родителем, ошибки задаются формой. TextField: clearable (по умолчанию true); пароль использует показ/скрытие вместо очистки. Select — системное меню. ReadOnly Select — статическое значение и hidden input для отправки формы. [Figma Light](https://www.figma.com/design/qTLyRxJkaRvicTercpHUqr?node-id=42-291) · [Figma Dark](https://www.figma.com/design/qTLyRxJkaRvicTercpHUqr?node-id=42-752).',
      },
    },
  },
} satisfies Meta<typeof FieldShowcase>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
export const Light: Story = { globals: { theme: 'light' } };
export const Dark: Story = { globals: { theme: 'dark' } };
