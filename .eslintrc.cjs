module.exports = {
  ignorePatterns: ['**/vendors/**'],
  plugins: ['import', '@typescript-eslint', 'prettier'],
  parser: '@typescript-eslint/parser',
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal'],
        pathGroups: [
          {
            pattern: '@(react|react-native)',
            group: 'external',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['react'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'prettier/prettier': 'error',
    'no-restricted-imports': [
      'error',
      '@material-ui/core',
      '@material-ui/icons',
      'lodash', // Use lodash-es instead
    ],
  },
  parserOptions: {
    project: './tsconfig.json',
  },
};
