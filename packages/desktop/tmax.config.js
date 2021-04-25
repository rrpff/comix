module.exports = {
  panes: [
    { label: 'Server', command: 'npm run server:start:watch', cwd: __dirname },
    { label: 'Client', command: 'npm run client:start', cwd: __dirname },
  ]
}
