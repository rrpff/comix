const path = require('path')

module.exports = {
  title: '@comix',
  panes: [
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
          label: '@comix/desktop',
          command: 'npm run server:build:watch',
          cwd: path.join(__dirname, 'packages', 'desktop'),
        },
        {
          label: '@comix/library',
          command: 'npm run build:watch',
          cwd: path.join(__dirname, 'packages', 'library'),
        },
        {
          label: '@comix/scan-directory',
          command: 'npm run build:watch',
          cwd: path.join(__dirname, 'packages', 'scan-directory'),
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
