module.exports = {
  extends: ['@commitlint/config-conventional'],

  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'chore', 'docs', 'refactor', 'style', 'improve', 'revert', 'perf'],
    ],
    'footer-max-line-length': [1, 'always', 'Infinity'],
    'header-max-length': [1, 'always', 'Infinity'],
    'subject-case': [0],
  },
};
