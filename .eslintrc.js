module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    'linebreak-style': 'off',
    'comma-dangle': ['error', 'never'],
    'semi': ['error', 'never'],
    'space-before-function-paren': ['error', 'always'],
    'nonblock-statement-body-position': ['error', 'below'],
    'no-use-before-define': ['error', { functions: false } ],
    'no-underscore-dangle': 'off',
    'curly': ['error', 'multi-or-nest', 'consistent'],
    'operator-linebreak': ['error', 'after'],
    'no-param-reassign': ['error', { 'props': false }],
    'no-await-in-loop': 'off',
    'class-methods-use-this': 'off',
    'arrow-body-style': 'off'
  }
};
