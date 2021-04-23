module.exports = {
  panes: [
    { label: 'Build', command: 'npm run build:watch', cwd: __dirname },
    { label: 'App', command: 'npm run start:watch', cwd: __dirname },
  ]
}
