import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import comments from '@eslint-community/eslint-plugin-eslint-comments/configs';
import cds from '@sap/eslint-plugin-cds';
import jestPlugin from 'eslint-plugin-jest';
import jsdoc from 'eslint-plugin-jsdoc';
import jsonc from 'eslint-plugin-jsonc';
import markdown from '@eslint/markdown';
import n from 'eslint-plugin-n';
import packageJson from 'eslint-plugin-package-json';
import perfectionist from 'eslint-plugin-perfectionist';
import * as regexp from 'eslint-plugin-regexp';
import yml from 'eslint-plugin-yml';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import checkFile from 'eslint-plugin-check-file';

export default defineConfig(
  {
    ignores: [
      '.github/*',
      '.local/**',
      '.vscode/*',
      'coverage*',
      'lib',
      'gen',
      'node_modules*/',
      'app/**/node_modules',
      '**/*.snap',
      'eslint.config.mjs',
      'jest.config.js',
      '@cds-models',
      'app/**/dist',
      'app/**/webapp/test',
      'srv/external/**',
      '**/*.md',
    ],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },

  eslint.configs.recommended,
  {
    files: ['**/*.test.ts'],
    ...jestPlugin.configs['flat/recommended'],
    rules: {
      ...jestPlugin.configs['flat/recommended'].rules,
    },
  },

  ...jsonc.configs['flat/recommended-with-json'],

  ...markdown.configs.recommended,

  ...yml.configs['flat/recommended'],
  ...yml.configs['flat/prettier'],

  comments.recommended,
  {
    rules: {
      '@eslint-community/eslint-comments/disable-enable-pair': 'off',
    },
  },

  jsdoc.configs['flat/contents-typescript-error'],
  jsdoc.configs['flat/logical-typescript-error'],
  jsdoc.configs['flat/stylistic-typescript-error'],

  n.configs['flat/recommended'],

  packageJson.configs.recommended,
  {
    rules: {
      'package-json/sort-collections': 'off',
      'package-json/valid-package-definition': 'off',
    },
  },
  {
    files: ['app/**/package.json'],
    rules: {
      'package-json/require-exports': 'off',
      'package-json/require-files': 'off',
      'package-json/require-license': 'off',
      'package-json/require-repository': 'off',
      'package-json/require-sideEffects': 'off',
      'package-json/require-attribution': 'off',
      'package-json/no-empty-fields': 'off',
    },
  },

  perfectionist.configs['recommended-natural'],
  {
    rules: {
      'perfectionist/sort-classes': 'off',
    },
  },

  regexp.configs['flat/recommended'],

  ...tseslint.config({
    extends: [...tseslint.configs.strict, ...tseslint.configs.stylistic],
    files: ['**/*.js', '**/*.ts'],
    rules: {
      'logical-assignment-operators': ['error', 'always', { enforceForIfStatements: true }],
      'operator-assignment': 'error',
      'jsdoc/lines-before-block': 'off',
      'jsdoc/check-tag-names': 'off',
      'no-constant-condition': 'off',
      '@typescript-eslint/no-unnecessary-type-parameters': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { caughtErrors: 'all' }],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'import',
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'forbid',
        },
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'forbid',
        },
        {
          selector: 'objectLiteralProperty',
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'forbid',
          filter: {
            match: false,
            regex: '_ID$|_DraftUUID$|_code$|<=|>=|^h_hwaer$',
          },
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
          leadingUnderscore: 'forbid',
        },
        {
          selector: 'variableLike',
          format: ['camelCase'],
          leadingUnderscore: 'forbid',
          filter: {
            match: false,
            regex: '_ID$',
          },
        },
        {
          selector: 'variable',
          modifiers: ['const'],
          leadingUnderscore: 'forbid',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
          filter: {
            match: false,
            regex: '_ID$',
          },
        },
      ],
      'id-length': ['error'],
      'n/no-unsupported-features/node-builtins': ['error', { allowExperimental: true }],
      'n/no-unsupported-features/es-syntax': [
        'error',
        {
          version: '>=20.0.0',
          ignores: [],
        },
      ],
      'n/no-missing-import': 'off',
      'perfectionist/sort-objects': [
        'error',
        {
          order: 'asc',
          partitionByComment: true,
          type: 'natural',
        },
      ],

      'perfectionist/sort-imports': [
        'error',
        {
          groups: [['side-effect'], ['builtin', 'external'], ['internal'], ['parent', 'sibling', 'index']],
          order: 'asc',
          type: 'natural',
        },
      ],

      'no-useless-rename': 'error',
      'object-shorthand': 'error',
    },
  }),

  cds.configs.recommended,
  {
    files: ['**/*.cds'],
    rules: {
      '@sap/cds/start-elements-lowercase': 'error',
      '@sap/cds/start-entities-uppercase': 'error',
      '@sap/cds/auth-valid-restrict-grant': 'off',
    },
  },

  {
    files: ['*.jsonc'],
    rules: {
      'jsonc/comma-dangle': 'off',
      'jsonc/no-comments': 'off',
      'jsonc/sort-keys': 'error',
    },
  },
  {
    files: ['**/*.{yml,yaml}'],
    rules: {
      'yml/no-empty-mapping-value': ['off'],
      'yml/sort-sequence-values': ['off'],
    },
  },

  {
    plugins: { 'check-file': checkFile },
    rules: {
      'check-file/filename-naming-convention': [
        'error',
        { '**/*.{js,ts,mjs,cjs,mts,cts}': 'KEBAB_CASE' },
        { ignoreMiddleExtensions: true },
      ],
    },
  },
  {
    files: ['apps/**/webapp/**', 'app/**/webapp/**'],
    plugins: { 'check-file': checkFile },
    rules: {
      'check-file/filename-naming-convention': [
        'error',
        { '**/*.{js,ts,mjs,cjs,mts,cts}': 'PASCAL_CASE' },
        { ignoreMiddleExtensions: true },
      ],
    },
  },
  eslintConfigPrettier,
);
