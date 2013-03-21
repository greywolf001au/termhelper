module.exports = {
  settings: {
    echoKeys: true,									// Echo key strokes
    prompt: '> ',									// Prompt symbols
    termHistory: -1,								// Keep command history
    allowKill: true,								// Allow CTRL+C to kill application
    lineEnd: '\n',									// Line end character
    appendEndChar: true,							// Append end character to commands
    debug: false,									// Show debug messages in terminal
    allowRun: true,									// Allow run command to be used to execute other applications
    error_level: 3,									// Set error output type [0: none, 1: log only, 2: output (uses log.level option), 3: throw (may cause application crash)]
  },
  log: {
  	path: '',										// Path to store log files
  	dir_mode: '0775',								// use the following directory mode when creating non-existant log path
  	level: 3,										// Which commands/output should be logged (0: none, 1: output only, 2: input only, 3: all input and output)
  	extension: 'log',								// append this extension to the logfile name
  	format: 0,										// use date format for log filename (0: d-m-y, 1: m-d-y, 2: y-m-d)
  	hourly: false,									// create a new log file every hour
  	timestamp: true,								// prepend timestamp to log entries
  },
  alias: {
  	// run commands using the following line input aliases
  	run: 'run',										// Alias for run command
  	echo: 'echo',									// Alias for echo command
  	exit: 'exit',									// Alias for exit command
  	prompt: 'prompt',								// Change the prompt inside
  },
  // The following options and methods can be changed but requires you to change parts of the main code to match
  // These are provided here to keep the main code clean and for advanced users to change if required
  input: {
    string: '',										// The current input string
    history: [],									// An array for storing history
    history_position: -1,							// The current position in the history
    cursor_pos: 0									// Position the cursor is on the line
  },
  Prompt: function () {
  	// This is the prompt method that displays the prompt in the terminal
    process.stdout.write(this.settings.prompt);
    this.input.cursor_pos += this.settings.prompt.length;
  },
}
