import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../catalog/**/*.stories.tsx'],
  staticDirs: ['../public'],
  framework: '@storybook/react-vite',
  addons: ['@storybook/addon-docs', '@storybook/addon-themes'],
  core: { disableTelemetry: true },
};
export default config;
