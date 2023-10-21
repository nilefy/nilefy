module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    //todo remove below rules later.
    //? these replace errors with warnings for fast coding.
    '@typescript-eslint/no-explicit-any': 'warn',
    'eol-last': 'warn', // Disables the rule that enforces an empty line at the end of a file
    'comma-dangle': 'warn',
    'import/newline-after-import': 'off',
    'import/no-duplicates': 'off',
    'indent': 'warn',
    'array-bracket-newline': 'warn',
    'array-element-newline': 'warn',
    'object-curly-newline': 'warn',

  },
};
