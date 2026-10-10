import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import i18next from 'eslint-plugin-i18next';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'coverage'] },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  i18next.configs['flat/recommended'],

  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-restricted-imports': [
        'error',
        {
          paths: [{ name: '@tabler/icons-react', message: 'Use lucide-react (LM3-design-system.md §9).' }],
        },
      ],
      'max-lines': ['error', { max: 200, skipBlankLines: true, skipComments: true }],
    },
  },

  // Data files and tests are exempt from the size limit; tests may use literal strings
  {
    files: ['src/i18n/locales/**', 'src/**/*.test.{ts,tsx}', 'src/test/**'],
    rules: { 'max-lines': 'off', 'i18next/no-literal-string': 'off' },
  },

  prettier,
);
