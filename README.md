  Terminal Helper

  Version: 0.1.0

  Author: Elijah Cowley

  Website: http://epcit.biz
  
  IRC: irc://irc.epcit.biz:6667
  
  IRC_Nick: GreyWolf
  
  IRC_Channels: #epcit, #help, #nodejs

This module is designed to allow both keypress and string event firing and includes some helper methods for terminal commands.
I have also included basic processing of arrow keys and backspace.

Tested on Debian Linux, please contact me on IRC or via email [ ecowley@epcit.biz ] to report any bugs or get help using this modules.

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

    |  Setting      |    Default Value    |               Description             |
    -------------------------------------------------------------------------------
      echoKeys          true                 Outputs key on key stroke
      prompt            '> '                 Sets the prompt string
      termHistory       true                 Keep command history
      allowKill         true                 Allow CTRL + C to kill app
      lineEnd           '\n'                 Line end charater to use
      appendEndChar     true                 Append lineEnd character to event data
      debug             false                Outputs keystroke data
      allowRun          true                 Allow running of shell commands
      
      

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
        UP          Arrow Scroll back through history
        Down        Arrow Scroll forward through history
        Left        Arrow Move cursor back
        Right       Arrow Move cursor forward
      Backspace     Delete character behind cursor
        Delete      Delete character infront of cursor
        Enter       Process line
        CTRL+C      Exit application
        Home		Move cursor to start of line
        End			Move cursor to end of line

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
    Set			    term.set(s, k, v)		Change section of termhelper.lib.js
    On				term.on(evt, method)	Overwrite default event handler with custom method
    Clear              term.Clear()         Clear terminal window
    ClearLine        term.ClearLine()       Clear output from current line (clear prompt, does not clear input string)
    Prompt            term.Prompt()         Output prompt string
    Write            term.Write(text)       Send text to terminal
    Writeln         term.Writeln(text)      Send text to terminal with line end
    CursorPos        term.CursorPos()       Returns an integer denoting cursor position
    CursorTo         term.CursorTo(pos)     Move the cursor to a specified position on the line
    Run              term.Run(command)      Run shell commands from your node apps
    Echo			 term.Echo(command)		Echo string, evaluates JavaScript
    log.Write		term.log.Write(data)	Write data to log file
    log.Writeln		term.log.Writeln(data)	Write data to log and move to next line

  -----------------------------------------------------------------------------------------------

** Processed Input

Line inputs processed from terminal

	Run			Use the run alias to execute an application
	Echo		Evaluate some JavaScript and echo the result
	Prompt		Change the terminal prompt, can evaluate JavaScript when setting
	Exit		Exits the application

  -----------------------------------------------------------------------------------------------

** Changes For Future Versions

1) Make this a standalone module without requirement of keypress module.

2) Basic code cleanup and bug fixes.

3) Possibly add string colouring and styles.

  -----------------------------------------------------------------------------------------------

** Complimentary Modules

Colors module will allow terminal colors and styles however this library extends the String prototype. While it works quite nicely it is not the prefered method.

  -----------------------------------------------------------------------------------------------

** Other Projects

Node.js IRC Client, this application has the alias NoIRC and will be made available soon.
NoIRC allows browser connections to an IRC server.
This project is still in development and is being tested on UnrealIRCD.


