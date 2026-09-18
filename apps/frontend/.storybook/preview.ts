import type { Preview, Renderer } from '@storybook/react-vite';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import '../src/shared/ui/styles.css';

const preview: Preview = {
  decorators: [
    withThemeByDataAttribute<Renderer>({
      themes: { light: 'light', dark: 'dark' },
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
  ],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { disable: true },
    viewport: {
      options: {
        mobile320: {
          name: 'Mobile · 320',
          styles: { width: '320px', height: '740px' },
        },
        mobile390: {
          name: 'Mobile · 390',
          styles: { width: '390px', height: '844px' },
        },
        tablet768: {
          name: 'Tablet · 768',
          styles: { width: '768px', height: '1024px' },
        },
        desktop1440: {
          name: 'Desktop · 1440',
          styles: { width: '1440px', height: '1000px' },
        },
      },
    },
  },
};
export default preview;
