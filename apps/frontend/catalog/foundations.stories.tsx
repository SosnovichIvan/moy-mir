import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '../src/shared/ui';
import type { ControlSize, IconName } from '../src/shared/ui';
import schema from '../../../openApi/frontend/ui.schema.json';

const figma =
  'https://www.figma.com/design/qTLyRxJkaRvicTercpHUqr?node-id=17-3';
const colors = [
  'bg',
  'surface',
  'ink',
  'muted',
  'accent',
  'soft',
  'alt',
  'line',
  'onAccent',
  'onPressed',
  'hover',
  'danger',
  'dangerSoft',
  'controlBorder',
  'focus',
];
const sizes: ControlSize[] = ['s', 'm', 'l'];

function Foundations() {
  return (
    <main className="mx-auto flex max-w-[1200px] flex-col gap-8 p-4 md:p-6 lg:p-8">
      <header className="space-y-4">
        <p className="text-label font-semibold text-accent">
          МОЙ МИР · ОСНОВЫ БИБЛИОТЕКИ
        </p>
        <h1 className="text-display">Свои люди. Общие планы.</h1>
        <p className="text-body text-muted">
          Близко к природе · Light / Dark. Выберите тему и ширину экрана в
          панели каталога.
        </p>
        <a
          className="inline-flex min-h-11 items-center text-accent underline"
          href={figma}
        >
          Открыть основы в Figma
        </a>
      </header>
      <section
        aria-label="Палитра"
        className="rounded-mm-28 bg-surface p-4 md:p-6"
      >
        <h2 className="mb-6 text-heading">Цвета и поверхности</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {colors.map((name) => (
            <div key={name} className="min-w-0 space-y-2">
              <div
                className="h-16 rounded-mm-12 border border-line"
                style={{ backgroundColor: `var(--mm-${name})` }}
              />
              <p className="break-words text-label">{name}</p>
            </div>
          ))}
        </div>
      </section>
      <section
        aria-label="Типографика"
        className="space-y-4 rounded-mm-28 bg-surface p-4 md:p-6"
      >
        <h2 className="text-heading">Типографика</h2>
        <p className="font-heading text-display font-bold">
          Display · Свой круг
        </p>
        <p className="font-heading text-heading font-bold">
          Heading · Встречаемся чаще
        </p>
        <p className="font-heading text-title font-bold">
          Title · Планы на сегодня
        </p>
        <p className="text-body">
          Body · Общайтесь и делитесь планами с друзьями.
        </p>
        <p className="text-label font-semibold">Label · Добавить друга</p>
        <p className="text-caption text-muted">
          Caption · Manrope Bold / Inter
        </p>
      </section>
      <section
        aria-label="Размеры"
        className="space-y-4 rounded-mm-28 bg-surface p-4 md:p-6"
      >
        <h2 className="text-heading">Размеры S / M / L</h2>
        <p className="text-muted">
          Области контролов 44 / 48 / 56 px. Размер выбирается по сценарию,
          ширина — по контейнеру.
        </p>
        <div className="flex flex-wrap items-end gap-4">
          {sizes.map((size) => (
            <div
              key={size}
              className="flex items-center justify-center rounded-mm-12 border border-control-border px-4 text-label"
              data-control-size={size}
              style={{ minHeight: `var(--mm-control-${size})` }}
            >
              {size.toUpperCase()}
            </div>
          ))}
        </div>
      </section>
      <section
        aria-label="Иконки"
        className="space-y-4 rounded-mm-28 bg-surface p-4 md:p-6"
      >
        <h2 className="text-heading">Иконки · сетка 24, stroke 2</h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          {schema.definitions.IconName.enum.map((name) => (
            <div key={name} className="space-y-3">
              <p className="text-label">{name}</p>
              <div className="flex items-center gap-3 text-accent">
                {sizes.map((size) => (
                  <Icon key={size} name={name as IconName} size={size} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <section
        aria-label="Отступы"
        className="space-y-4 rounded-mm-28 bg-surface p-4 md:p-6"
      >
        <h2 className="text-heading">Отступы и радиусы</h2>
        <p className="text-body">
          Отступы: 0 / 4 / 8 / 12 / 16 / 20 / 24 / 28 / 32 / 40 / 48 / 64 px.
        </p>
        <div className="flex flex-wrap gap-4">
          {[8, 12, 16, 20, 28, 999].map((radius) => (
            <div
              key={radius}
              className="flex h-16 w-16 items-center justify-center bg-soft text-label"
              style={{ borderRadius: `var(--mm-radius-${radius})` }}
            >
              {radius}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
const meta = {
  id: 'foundations',
  title: 'Основы/Обзор',
  component: Foundations,
  parameters: {
    docs: {
      description: {
        component: `Основа библиотеки. [Figma 17:3](${figma}). Сами управляющие компоненты будут реализованы в блоке D.`,
      },
    },
  },
} satisfies Meta<typeof Foundations>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
export const Light: Story = { globals: { theme: 'light' } };
export const Dark: Story = { globals: { theme: 'dark' } };
