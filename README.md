  Terminal Helper

  Version: 0.1.7

  Author: Elijah Cowley

  Website: http://epcit.biz
  
  IRC: irc://irc.epcit.biz:6667
  
  IRC_Nick: GreyWolf
  
  IRC_Channels: #epcit, #help, #nodejs

This module is designed to allow both keypress and string event firing and includes some helper methods for terminal commands.
I have also included basic processing of arrow keys and backspace.

Tested on Debian Linux, please contact me on IRC, via email [ ecowley@epcit.biz ] or using GitHub [ https://github.com/greywolf001au/termhelper ] to report any bugs or get help using this modules.

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

    |  Section    |  Setting      |    Default Value    |               Description                   |
    ---------------------------------------------------------------------------------------------------
      settings       echoKeys          true                 Outputs key on key stroke
      settings       prompt            '> '                 Sets the prompt string
      settings       termHistory       true                 Keep command history
      settings       allowKill         true                 Allow CTRL + C to kill app
      settings       lineEndOut        '\n'                 Line end charater to output
      settings       lineEndIn         '\n'                 Line end charater to capture from input
      settings       appendEndChar     true                 Append lineEnd character to event data
      settings       debug             false                Outputs keystroke data
      settings       allowRun          true                 Allow running of shell commands
      settings       date_format       0                    Sets the format to use for dates
      settings       date_splitter     '-'                  Sets the default date splitter (for prompt)
      settings       locale            'default'            Sets the language locale (See locale folder for supported locale files)
      settings       processing        true                 Turns on or off key and line processing (false will stop all commands from being processed)
    ---------------------------------------------------------------------------------------------------  
      log            path              ''                   Set the path for storing logs
      log            dir_mode          '0775'               Use mode when creating paths
      log            level             3                    Logging level (input, output, both)
      log            extension         'log'                Create log files with this extension
      log            format            0                    Date format for log filenames
      log            hourly            false                Create a new log file each hour
      log            timestamp         true                 Place timestamp before each log entry
      log            date_splitter     '-'                  Use this date splitter for log files
    ---------------------------------------------------------------------------------------------------
      alias          run               'run'                Change the terminal run command
      alias          echo              'echo'               Change the terminal echo command
      alias          exit              'exit'               Change the terminal exit command
      alias          prompt            'prompt'             Change the terminal prompt command
      alias          version           'version'            Change the terminal version command
      alias          show              'show'               Change the terminal show command
      
      

Settings can be modified using in the following manner:
    term.set(section, key, value)
Where 'section' refers to the section key, current sections are: settings, log, alias
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

Note:
	To have no prompt displayed set the prompt to a blank string.
	

  -----------------------------------------------------------------------------------------------

** Processed Keys

    |   Key   |           Default Function             |
    ----------------------------------------------------
      UP            Arrow Scroll back through history
      Down          Arrow Scroll forward through history
      Left          Arrow Move cursor back
      Right         Arrow Move cursor forward
      Backspace     Delete character behind cursor
      Delete        Delete character infront of cursor
      Enter         Process line
      CTRL+C        Exit application
      Home          Move cursor to start of line
      End           Move cursor to end of line

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

Line processing will give an invalid command when false is returned from the event handler method.
Optionally an object can be returned containing a key named 'valid' and a boolean value.
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

Line inputs processed from terminal

    Run			Use the run alias to execute an application
    Echo		Evaluate some JavaScript and echo the result
    Prompt		Change the terminal prompt
    Exit		Exits the application

  -----------------------------------------------------------------------------------------------

** Prompt String

The prompt string sets the prompt that is dispayed for command entry. The string can be a literal string or a JavaScript string to be evaluated.
The prompt string can be changed by editing the settings.prompt variable in termhelper.lib.js, using the set method to change the settings.prompt variable or by calling the prompt alias at the command line.

You may also use the following notation to insert information to the prompt string:

    %d		The date with the format as defined in termhelper.lib.js
    %p		The current command line path
    %t		The time, this uses the systems locale time string
    %v		Termhelper version number
    %!		The command history position number (changes when cycling through history)
    %#		The history length (command number)
    
Examples:
    
In termhelper.lib.js:

    settings: {
      prompt: "%p [%!]> ";
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

    prompt this.module.name + " " this.module.version + "> "
  -----------------------------------------------------------------------------------------------

** Changes For Future Versions

1) Make this a standalone module without requirement of keypress module.

2) Possibly add string colouring and styles.

  -----------------------------------------------------------------------------------------------

** Complimentary Modules

Colors: this module will allow terminal colors and styles however this library extends the String prototype. While it works quite nicely it is not the prefered method.

  -----------------------------------------------------------------------------------------------

** Other Projects

Node.js IRC Client, this application has the alias NoIRC and will be made available soon.
NoIRC allows browser connections to an IRC server.
This project is still in development and is being tested on UnrealIRCD.
if you run a different IRCD and would like to create an interpreter please contact me on my IRC server.


