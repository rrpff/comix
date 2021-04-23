module.exports = {
  panes: [
    { label: 'Electron Build', command: 'npm run server:build:watch', cwd: __dirname },
    { label: 'Electron', command: 'npm run server:start:watch', cwd: __dirname },
    { label: 'Client', command: 'npm run client:start', cwd: __dirname },
  ]
}
