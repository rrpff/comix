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
          command: 'npm run build:watch',
          cwd: path.join(__dirname, 'packages', 'parser'),
        },
        {
          label: '@comix/ui',
          command: 'npm run build:watch',
          cwd: path.join(__dirname, 'packages', 'ui'),
        },
        {
          label: '@comix/library-desktop',
          command: 'npm run server:build:watch',
          cwd: path.join(__dirname, 'packages', 'library-desktop'),
        },
        {
          label: 'electron-react-ipc',
          command: 'npm run build:watch',
          cwd: path.join(__dirname, 'packages', 'electron-react-ipc'),
        },
      ],
    },
  ],
}
