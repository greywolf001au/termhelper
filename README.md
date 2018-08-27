  Terminal Helper
  Author: Elijah Cowley
  Website: http://au.epcit.biz


This module is designed to allow both keypress and string event firing and includes some helper methods for terminal commands.
I have also included basic processing of arrow keys and backspace.

Tested on Debian Linux, please contact me via email [ ecowley@epcit.biz ] or using GitHub [ https://github.com/greywolf001au/termhelper ] to report any bugs or get help using this modules.

  -----------------------------------------------------------------------------------------------

** Install

Install this module using NPM or copy the package to your applications '/node_modules' directory.

    npm install termhelper

  -----------------------------------------------------------------------------------------------

** Useage

In the application files you would like to use this module add the following line:

    var term = require('termhelper')

  -----------------------------------------------------------------------------------------------

** Settings

The settings can be changed in termhelper.lib.js
The main settings are described here for reference, other settings may be added in future versions.

Available Settings:


    ---------------------------------------------------------------------------------------------------
    |      Setting      |    Default Value    |               Description
    ---------------------------------------------------------------------------------------------------
    | Section: settings
    ---------------------------------------------------------------------------------------------------
    echoKeys                true                 Outputs key on key stroke
    prompt                  '> '                 Sets the prompt string
    termHistory             true                 Keep command history
    allowKill               true                 Allow CTRL + C to kill app
    lineEndOut              '\n'                 Line end charater to output
    lineEndIn               '\n'                 Line end charater to capture from input
    appendEndChar           true                 Append lineEnd character to event data
    debug                   false                Outputs keystroke data
    allowRun                true                 Allow running of shell commands
    date_format             0                    Sets the format to use for dates
    date_splitter           '-'                  Sets the default date splitter (for prompt)
    locale                  'default'            Sets the language locale (See locale folder for supported locale files, currently supports 'default' only)
    locale_path             './locale'           Sets the path to the locale file (without trailing slash)
    processing              true                 Turns on or off key and line processing (false will stop all commands from being processed)
    proc_blank_line         true                 Turn on or off the default processing of a blank line
	use_old_stdin_stream    false                Use old stdin processing stream for keypress module (set to true if you are using an older version of keypress)
	exit                    0                    Override an exit value or inject a method (see notes below for options)
    ---------------------------------------------------------------------------------------------------
    | Section: log
    ---------------------------------------------------------------------------------------------------  
	path              ''                   Set the path for storing logs
	dir_mode          '0775'               Use mode when creating paths
	level             3                    Logging level (input, output, both)
	extension         'log'                Create log files with this extension
	format            0                    Date format for log filenames
	hourly            false                Create a new log file each hour
	timestamp         true                 Place timestamp before each log entry
	date_splitter     '-'                  Use this date splitter for log files
    ---------------------------------------------------------------------------------------------------
	| Section: alias
    ---------------------------------------------------------------------------------------------------
	run               'run'                Change the terminal run command
	echo              'echo'               Change the terminal echo command
	exit              'exit'               Change the terminal exit command
	prompt            'prompt'             Change the terminal prompt command
	version           'version'            Change the terminal version command
	show              'show'               Change the terminal show command
	time              'time'               Output time to terminal
  	date              'date'               Output date to terminal
    clear             'clear'              Clear terminal
    uptime            'uptime'             Display how long the application has been running (most accurate if the termhelper object is initialised early in your application)
    unixTime          'utime'              Display the time as a unix timestamp
    __clock           '%*'                 Start the clock (only works in a prompt)
    console           'console'            Display which console we are using
    ===================================================================================================

    ---------------------------------------------------------------------------------------------------
    | Result        |  Identifier    |     Default Value
    ---------------------------------------------------------------------------------------------------
	| Section: globalVars
    ---------------------------------------------------------------------------------------------------
	Date              '%d'                 'exports.formatDate(thlib.settings.date_format, thlib.settings.date_splitter)'
    Current Path      '%p'                 '__dirname'
    Locale Time       '%t'                 'd.toLocaleTimeString()'
    History Position  '%@'                 'thlib.input.history_position'
    History Length    '%#'                 'thlib.input.history.length'
    Version           '%v'                 'exports.version()'
    Unix Time         '%u'                 'd.getUnixTime()'
    Uptime            '%uptime'            'exports.counterFormat(exports.uptime()).toString()'
    Start Clock       '%*'                 ''

    ---------------------------------------------------------------------------------------------------
	| Section: input
    ---------------------------------------------------------------------------------------------------
	This section should not be changed unless you know what you are doing and change the code
	to use the new object for line & key processing. New variables can be added to the object if you require
	or your methods can manipulate these strings before or after default processing.
    ---------------------------------------------------------------------------------------------------
	| Section: temp
    ---------------------------------------------------------------------------------------------------
	Stores a temporary copy of the input string for xconsole and some variables which may be used in future.
	These are added by termhelper at run time to save adding to many unchangeable configuartion values in the conf file.


Settings can be modified in the following manner:
    term.set(section, key, value)

Where 'section' refers to the section key, current sections are: settings, log, alias & locale
If a section is null the default section of 'settings' will be used.
Key refers to the settings key to change, key may be an object of key/value pairs.
Value is the new value for the setting.

  Example:

    term.set('settings', 'prompt', 'node.js> ');

  or

    term.set(null, {
      prompt: 'node.js> ',
      debug: true
    });

Notes:
    To load a configuration file use term.set('settings', 'conf_path', '/path/to/my/conf') to load a configuration file (will not be read from config file to save recursive loads ocurring).
	To have no prompt displayed set the prompt to a blank string or null.

	The exit setting can be a string overriding the exit message by passing a string, the exit code if a number is given, a function to call prior to exiting the application or
	the following object:
	{
	  exitCode: exitCode,
	  message: message,
	  logLevel: logLevel,
	  logMessage: logMessage
	}
  -----------------------------------------------------------------------------------------------

** Processed Keys

    |   Key   |           Default Function             |
    ----------------------------------------------------
      Up            Arrow Scroll back through history
      Down          Arrow Scroll forward through history
      Left          Arrow Move cursor back
      Right         Arrow Move cursor forward
      Backspace     Delete character behind cursor
      Delete        Delete character infront of cursor
      Enter         Process line
      CTRL+C        Exit application
      Home          Move cursor to start of line
      End           Move cursor to end of line
	  CTRL+LEFT		Move cursor to the backwards to the start of each new word
	  CTRL+RIGHT    Move cursor forward to the start of each new word

  -----------------------------------------------------------------------------------------------

** Events

Events can be set for a single keypress and on line data using the following:

    term.on('before_proc', function(ch, key) {
      Add your code here....
    }

    term.on('keypress', function(ch, key) {
      Add your code here....
    }

    term.on('line', function(data) {
      Add your code here....
    }

Default key press processing can be bypassed by returning false from your event handler.
Example:

    term.on('before_proc', function(ch, key) {
      if (key && key.name === 'home') {
        Add code here....
        return false;
      }
      return { home: false }
    }

Note: bypassing command processing will cause all key press events to be bypassed including enter and CTRL+C, to skip individual keypress events return an object containing keyname: false
as shown for the home key above.

Line processing will give an invalid command when false is returned from the event handler method however if there is a matching command alias, return true to signal that a command
has been processed. This will stop the default command from running.
Optionally an object can be returned containing a key named 'valid' and a boolean value showing if a valid command was typed.
The prompt can be disabled for a command by returning an object with a 'prompt' key and the boolean value of false (see example.js)

  -----------------------------------------------------------------------------------------------

** Available Methods

Several methods have been added to make working in the terminal easier

    Method        |      Useage         |   Description                                                                    |
    ------------------------------------------------------------------------------------------------------------------------
    Set              term.set(s, k, v)       Change section of termhelper.lib.js
    On               term.on(evt, method)    Overwrite default event handler with custom method
    Clear            term.Clear()            Clear terminal window
    ClearLine        term.ClearLine()        Clear output from current line (clear prompt, does not clear input string)
    getPrompt        term.getPrompt()        Returns the evaluated prompt string
    Prompt           term.Prompt()           Output prompt string
    Write            term.Write(text)        Send text to terminal
    Writeln          term.Writeln(text)      Send text to terminal with line end out appended
    CursorPos        term.CursorPos()        Returns an integer denoting cursor position
    CursorTo         term.CursorTo(pos)      Move the cursor to a specified position on the line
    Run              term.Run(command)       Run shell commands from your node apps
    Eval             term.Eval(command)      Evaluate string as JavaScript
    Echo             term.Echo(obj)          Parse an object and output to cli
    log.set          term.log.set()          Set log options
    log.Write        term.log.Write(data)    Write data to log file
    log.Writeln      term.log.Writeln(data)  Write data to log and move to next line
    Version          term.Version()          Return termhelper version number
    Show             term.Show(key)          Return termhelper information (key denotes which peice of information to show e.g name, version etc)
    formatDate       term.formatDate(f, s)   Return the date with the format 'f' using the splitter 's'


  -----------------------------------------------------------------------------------------------

** Processed Input

Line inputs processed from the terminal (see aliases)

  -----------------------------------------------------------------------------------------------

** Prompt String

The prompt string sets the prompt that is dispayed for command entry. The string can be a literal string or a JavaScript string to be evaluated.
The prompt string can be changed by editing the settings.prompt variable in termhelper.lib.js, using the set method to change the settings.prompt variable or by calling the prompt alias at the command line.

You may also use the following notation to insert information to the prompt string (see globalVars for more info):

    %d		The date with the format as defined in termhelper.lib.js
    %p		The current command line path
    %t		The time, this uses the systems locale time string
    %v		Termhelper version number
    %@		The command history position number (changes when cycling through history)
    %#		The history length (command number)

Examples:

In termhelper.lib.js:

    settings: {
      prompt: "%p [%@]> ";
      ...
    }

In your application:

    term.set("settings", "prompt", "[%d]%p> ");

On the command line:

    prompt __dirname + '> ';

Note: The values set in these examples could be set using any of the prompt methods.

  -----------------------------------------------------------------------------------------------

** App object

A blank object called app has been added to store custom variables for displaying in a prompt or other evaluated commands.

    prompt this.app.name + "> "

  -----------------------------------------------------------------------------------------------

** Module object

Contains details about the termhelper module for use with evaluated methods and commands

    prompt this.module.name + " " + this.module.version + "> "

  -----------------------------------------------------------------------------------------------

** Complimentary Modules

Colors: this module will allow terminal colors and styles to be used.
To use with termhelper simply setup each as normal then use:
	term.write('test'.red);
Or
	term.write(colors.red('test'));
  -----------------------------------------------------------------------------------------------
  
  ** Other Projects
  *** AuroraChat Server
    A full featured IRCD like modular chat server with SSL and individual client encryption for secure group chat.
	Coming soon.