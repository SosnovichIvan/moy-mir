import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Checkbox,
  Radio,
  Switch,
  type SelectionConfiguration,
} from '../src/shared/ui';

const controls = { checkbox: Checkbox, radio: Radio, switch: Switch };

function Example({ kind, label, checked, disabled }: SelectionConfiguration) {
  const [value, setValue] = useState(checked);
  const Component = controls[kind];
  return (
    <Component
      label={label}
      checked={value}
      disabled={disabled === true}
      onCheckedChange={setValue}
    />
  );
}

function SelectionShowcase() {
  const [audience, setAudience] = useState('friends');
  return (
    <main className="mx-auto grid max-w-[1200px] gap-8 p-4 [overflow-wrap:anywhere] md:p-6 lg:p-8">
      <header className="grid gap-2">
        <h1 className="text-heading">Выбор и переключатели</h1>
        <p className="text-muted">
          Tab — переход, пробел — переключение, стрелки — выбор в радиогруппе.
          Наведение, нажатие и фокус показаны на работающих компонентах.
        </p>
      </header>
      <div className="grid gap-8 md:grid-cols-3">
        {(['checkbox', 'radio', 'switch'] as const).map((kind) => (
          <section
            key={kind}
            aria-label={kind}
            className="grid content-start gap-3"
          >
            <h2 className="text-title">{kind}</h2>
            <Example kind={kind} label="Выключено" checked={false} />
            <Example kind={kind} label="Включено" checked />
            <Example
              kind={kind}
              label="Недоступно, выключено"
              checked={false}
              disabled
            />
            <Example
              kind={kind}
              label="Недоступно, включено"
              checked
              disabled
            />
            <Example
              kind={kind}
              label="Получать напоминания о встречах и тренировках с друзьями"
              checked={false}
            />
          </section>
        ))}
      </div>
      <fieldset className="grid min-w-0 max-w-[358px] gap-3">
        <legend className="mb-3 text-title font-bold">Кто видит планы</legend>
        <Radio
          name="audience"
          value="friends"
          label="Только друзья"
          checked={audience === 'friends'}
          onCheckedChange={() => setAudience('friends')}
        />
        <Radio
          name="audience"
          value="nobody"
          label="Только я"
          checked={audience === 'nobody'}
          onCheckedChange={() => setAudience('nobody')}
        />
        <Radio
          name="audience"
          value="group"
          label="Группа — недоступно"
          disabled
          checked={false}
          onCheckedChange={() => setAudience('group')}
        />
      </fieldset>
    </main>
  );
}

const meta = {
  id: 'selection',
  title: 'Компоненты/Selection',
  component: SelectionShowcase,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Checkbox, Radio и Switch: обязательные label, checked, onCheckedChange; disabled по умолчанию false. Состояние принадлежит родителю. Для radio задавайте общий name и разные value, оборачивайте группу в fieldset с legend. DOM-атрибуты и ref передаются input, className — строке label. Область нажатия от 48 px, ширина по контейнеру. [Figma · Selection](https://www.figma.com/design/qTLyRxJkaRvicTercpHUqr?node-id=17-271).',
      },
    },
  },
} satisfies Meta<typeof SelectionShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
export const Light: Story = { globals: { theme: 'light' } };
export const Dark: Story = { globals: { theme: 'dark' } };
