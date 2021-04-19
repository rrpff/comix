const path = require('path')

module.exports = {
  title: '@comix',
  panes: [
    {
      label: 'Web',
      command: 'npm start',
      cwd: path.join(__dirname, 'packages', 'web-reader'),
    },
    {
      label: 'UI',
      commands: [
        {
          label: 'Story Server',
          command: 'npm start',
          cwd: path.join(__dirname, 'packages', 'web-reader', '.storybook', 'server'),
        },
        {
          label: 'Storybook',
          command: 'npm run storybook',
          cwd: path.join(__dirname, 'packages', 'web-reader'),
        }
      ]
    },
    {
      label: 'Builds',
      commands: [
        {
          label: '@comix/parser',
          command: 'npm run watch',
          cwd: path.join(__dirname, 'packages', 'parser'),
        },
      ],
    },
  ],
}
