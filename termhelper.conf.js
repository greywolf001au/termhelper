module.exports = {
  settings: {
    echoKeys: true,									// Echo key strokes
    prompt: '> ',									// Prompt symbols
    termHistory: -1,								// Keep command history
    allowKill: true,								// Allow CTRL+C to kill application
    lineEndOut: '\r\n',								// Output this line end character
    lineEndIn: '\r\n',                              // Listen for this line end character input
    appendEndChar: false,							// Append end character to commands
    debug: false,									// Show debug messages in terminal
    allowRun: false,									// Allow run command to be used to execute other applications
    error_level: 2,									// Set error output type [0: none, 1: log only, 2: output (and use log level option), 3: throw (cause application crash on error)]
    date_format: 0,									// Set the date format for logging & prompt (0: d-m-y, 1: m-d-y, 2: y-m-d)
    date_splitter: '-',								// The symbol used to split day, month & year in the prompt
    locale: 'default',                              // Locale string sets the termhelper language locale file
	locale_path: './locale',						// Path to locale file (without trailing slash)
    processing: true,                               // Perform processing of key and line input
    proc_blank_line: true,                          // Perform default processing for blank line (false will allow a blank line input to be passed to custom processing)
    use_old_stdin_stream: false,                    // Support old stdin stream for keypress module
    exit: 0,                                        // Application exit injector (can be message, code, object or function) See README.md for more information
    use_xconsole: true,                             // Hijack the console.log method to force a new line and replace prompt/line input (change this any time to switch between standard or hijacked)
    xc_callback: null                               // xconsole callback method runs after console.log is called when console hijack is enabled
  },
  log: {
  	path: '',										// Path to store log files
  	filename: '',									// Prepend this filename to the log files
  	dir_mode: '0775',								// Use the following directory mode when creating non-existant log path
  	level: 3,										// Which commands/output should be logged (0: none, 1: output only, 2: input only, 3: all input and output)
  	extension: 'log',								// Append this extension to the logfile name
  	format: 0,										// Use date format for log filename (0: d-m-y, 1: m-d-y, 2: y-m-d)
  	hourly: false,									// Create a new log file every hour
  	timestamp: true,								// Prepend timestamp to log entries
  	date_splitter: '-'								// The date splitter symbol used for log filenames
  },
  alias: {
  	// run commands using the following line input aliases
  	run: 'run',										// Alias for run command
  	echo: 'echo',									// Alias for echo command
  	exit: 'exit',									// Alias for exit command
  	prompt: 'prompt',								// Change the prompt inside
  	version: 'version',                             // Output termhelper version
  	show: 'show',                                   // Output module details
  	time: 'time',                                   // Output time to terminal
  	date: 'date',                                   // Output date to terminal
    clear: 'clear',                                 // Clear terminal
    uptime: 'uptime',                               // Display how long the application has been running (most accurate if the termhelper object is initialised early in your application)
    unixTime: 'utime',                              // Display the time as a unix timestamp
    __clock: '%*',                                  // start the clock (only works in a prompt)
    console: 'console'                              // display which console we are using
  },
  // you can change the global vars here (globals will be available in prompt, echo etc)
  // termhelper will attempt to evaluate the string as JavaScript first allowing access to internal functions & variables
  globalVars: {
      '%d': 'exports.formatDate(thlib.settings.date_format, thlib.settings.date_splitter)',
      '%p': '__dirname', //- Path
      '%t': 'd.toLocaleTimeString()', //- Time (locale based)
      '%!': 'thlib.input.history_position', //- History Position (may remove from future releases)
      '%@': 'thlib.input.history_position', //- History Position (because @ history position seems more appropriate)
      '%#': 'thlib.input.history.length', //- History length
      '%v': 'exports.version()', //- Termhelper version
      '%u': 'd.getUnixTime()', //- Unix time (seconds passed since 1/1/1970 10:00:00am)
      '%uptime': 'exports.counterFormat(exports.uptime()).toString()', //- Display the length of time this module has been running (require termhelper early for most accurate app uptime)(process.uptime was problematic but will keep testing)
      '%*': '' //- Clock, this will start a timer to update the prompt (note: this is provided to change the variable identifier not the value)

  },
  // The following options can be changed but requires you to change parts of the main code to match
  // These are provided here to keep the main code clean and for advanced users to change if required
  input: {
    string: '',										// The current input string
    history: [],									// An array for storing history
    history_position: -1,							// The current position in the history
    cursor_pos: 0									// Horizontal position of the cursor
  }
}
