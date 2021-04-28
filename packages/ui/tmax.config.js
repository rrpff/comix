module.exports = {
  panes: [
    { label: 'Storybook', command: 'npm run stories:start', cwd: __dirname },
    { label: 'Fixture Server', command: 'npm run stories:fixtures-server', cwd: __dirname },
  ]
}
