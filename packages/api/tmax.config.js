module.exports = {
  panes: [
    { label: 'API', command: 'npm run start:watch', cwd: __dirname },
    {
      label: 'Builds',
      commands: [
        { label: 'Schema', command: 'npm run schema:build:watch', cwd: __dirname },
      ]
    }
  ]
}
