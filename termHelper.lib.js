module.exports = {
  Settings: {
    echoKeys: true,
    prompt: '> ',
    termHistory: true,
    allowKill: true,
    lineEnd: '\n',
    debug: true
  },
  Prompt: function() {
    process.stdout.write(this.Settings.prompt);
    this.input.cursor_pos += this.Settings.prompt.length
  },
  input: {
    string: '',
    history: [],
    history_position: -1,
    cursor_pos: 0
  }
}
