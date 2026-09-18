import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '../src/shared/ui';
import schema from '../../../openApi/frontend/ui.schema.json';

const meta = {
  id: 'icon',
  title: 'Основы/Icon',
  component: Icon,
  tags: ['autodocs'],
  args: { name: 'plus', size: 'm' },
  argTypes: {
    name: { control: 'select', options: schema.definitions.IconName.enum },
    size: { control: 'radio', options: schema.definitions.ControlSize.enum },
  },
  decorators: [
    (Story) => (
      <div className="p-8 text-accent">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Декоративная иконка. Доступное имя задаёт содержащая её кнопка или ссылка. [Figma · Icons](https://www.figma.com/design/qTLyRxJkaRvicTercpHUqr?node-id=23-29).',
      },
    },
  },
} satisfies Meta<typeof Icon>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
