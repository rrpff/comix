module.exports = {
  panes: [
    { label: 'API', command: 'npm run start:watch', cwd: __dirname },
    {
      label: 'Builds',
      commands: [
        { label: 'Server', command: 'npm run server:build:watch', cwd: __dirname },
        { label: 'Schema', command: 'npm run schema:build:watch', cwd: __dirname },
      ]
    }
  ]
}
