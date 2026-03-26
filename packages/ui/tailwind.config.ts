import baseConfig from '@platform/config/tailwind/tailwind.config';
import type { Config } from 'tailwindcss';

const config: Config = {
  ...baseConfig,
  content: ['./src/**/*.{ts,tsx}'],
};

export default config;
