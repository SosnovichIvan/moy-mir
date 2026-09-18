import { useState } from 'react';
import {
  BrowserRouter,
  useLinkClickHandler,
  useSearchParams,
} from 'react-router';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Checkbox,
  Navigation,
  NavigationItem,
  type NavigationItemConfiguration,
} from '../src/shared/ui';
import './navigation.css';

const sections = [
  { label: 'Друзья', icon: 'users', href: 'friends' },
  { label: 'Заявки', icon: 'inbox', href: 'requests' },
  { label: 'Профиль', icon: 'user', href: 'profile' },
] as const satisfies readonly NavigationItemConfiguration[];

function RouterItem(props: NavigationItemConfiguration) {
  const onClick = useLinkClickHandler<HTMLAnchorElement>(props.href);
  return <NavigationItem {...props} onClick={onClick} />;
}

function Example() {
  const [params] = useSearchParams();
  const [long, setLong] = useState(false);
  const active = params.get('section') ?? 'friends';
  const items = sections.map((item) => {
    const next = new URLSearchParams(params);
    next.set('section', item.href);
    return (
      <RouterItem
        key={item.href}
        {...item}
        href={`?${next}`}
        current={active === item.href}
        label={
          long && item.href === 'requests' ? 'Приглашения в друзья' : item.label
        }
      />
    );
  });
  return (
    <main className="grid gap-6 p-4">
      <h1 className="text-heading">Navigation</h1>
      <p>
        Ссылки меняют раздел в адресе. Проверьте Tab, Enter, назад и открытие в
        новой вкладке.
      </p>
      <Checkbox
        label="Длинные подписи"
        checked={long}
        onCheckedChange={setLong}
      />
      <section aria-label="Адаптивная навигация" className="grid gap-4">
        <Navigation label="Основная">{items}</Navigation>
        <p role="status">
          Текущий раздел:{' '}
          {sections.find((item) => item.href === active)?.label ??
            'Другой раздел'}
        </p>
      </section>
      <section aria-label="Все активные разделы" className="grid gap-4">
        <h2 className="text-title">Все активные разделы</h2>
        {sections.map((selected) => (
          <Navigation key={selected.href} label={`Пример: ${selected.label}`}>
            {sections.map((item) => (
              <NavigationItem
                key={item.href}
                {...item}
                href={`?${new URLSearchParams({ ...Object.fromEntries(params), section: item.href })}`}
                current={item.href === selected.href}
              />
            ))}
          </Navigation>
        ))}
      </section>
      <section aria-label="Safe area" className="navigation-safe-demo">
        <h2 className="text-title">Safe area · пример 34 px</h2>
        <p>
          Панель находится в потоке. Оболочка добавляет нижний отступ один раз,
          поэтому содержание не перекрывается.
        </p>
        <div className="navigation-safe-shell">
          <Navigation label="С отступом устройства">{items}</Navigation>
        </div>
      </section>
    </main>
  );
}
function Showcase() {
  return (
    <BrowserRouter>
      <Example />
    </BrowserRouter>
  );
}
const meta = {
  id: 'navigation',
  title: 'Компоненты/Navigation',
  component: Showcase,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Navigation: label, brand, children NavigationItem. Пункт: label, href, icon, current и нативные свойства ссылки. Адаптивность: mobile <768, tablet <1024, desktop ≥1024. Safe area и размещение принадлежат shell. Пример подключает штатный useLinkClickHandler React Router; shared UI не зависит от router. [Figma](https://www.figma.com/design/qTLyRxJkaRvicTercpHUqr?node-id=62-406).',
      },
    },
  },
} satisfies Meta<typeof Showcase>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
export const Light: Story = { globals: { theme: 'light' } };
export const Dark: Story = { globals: { theme: 'dark' } };
