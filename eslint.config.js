const js = require('@eslint/js');

module.exports = [
  {
    ignores: ['node_modules/**'],
    rules: {
      'no-debugger': 'error'
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        console: 'readonly',
        document: 'readonly',
        window: 'readonly',
        navigator: 'readonly'
      }
    }
  }
];
