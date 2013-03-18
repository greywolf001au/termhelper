  Terminal Helper

  Version: 0.0.7

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

Available Settings:

    |  Setting      |    Default Value    |               Description             |
    -------------------------------------------------------------------------------
      echoKeys          true                 Outputs key on key stroke
      prompt            '> '                 Sets the prompt string
      termHistory       true                 Keep command history
      allowKill         true                 Allow CTRL + C to kill app
      lineEnd           '\n'                 Line end charater to use
      appendEndChar     true                 Append lineEnd character event data
      debug             false                Outputs keystroke data
      allowRun          true                 Allow running of shell commands
      runAlias          'run'                Command to execute run method

Settings can be modified using in the following manner:

    term.set('prompt', 'node.js> ');

or
    term.set({
      prompt: 'node.js> ',
      debug: true
    });

Note: To have no prompt displayed set the prompt to a blank string.

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
      if (ch == 's') {
        Add your code here....
        return false;
      }
    }

Note: bypassing command processing will cause all key press events to be bypassed including enter and CTRL+C, future versions will allow bypass of individual keystrokes

  -----------------------------------------------------------------------------------------------

** Available Methods

Several methods have been added to make working in the terminal easier

    Method        |      Useage         |   Description                                                                    |
    ------------------------------------------------------------------------------------------------------------------------
    Clear              term.Clear()         Clear terminal window
    ClearLine        term.ClearLine()       Clear output from current line (clear prompt, does not clear input string)
    Prompt            term.Prompt()         Output prompt string
    Write            term.Write(text)       Send text to terminal
    Writeln         term.Writeln(text)      Send text to terminal with line end
    CursorPos        term.CursorPos()       Returns an integer denoting cursor position
    CursorTo         term.CursorTo(pos)     Move the cursor to a specified position on the line
    Run              term.Run(command)      Run shell commands from your node apps

  -----------------------------------------------------------------------------------------------

** Changes For Future Versions

1) Bypassing events will be changed to allow selection of key events to bypass.

2) Make this a standalone module without requirement of keypress module.

3) Basic code cleanup and bug fixes.

4) Possibly add string colouring and styles.

  -----------------------------------------------------------------------------------------------

** Complimentary Modules

Colors module will allow terminal colors and styles however this library extends the String prototype. While it works quite nicely it is not the prefered method.

  -----------------------------------------------------------------------------------------------

** Other Projects

Node.js IRC Client, this application has the alias NoIRC and will be made available soon.
NoIRC allows browser connections to an IRC server.
This project is still in development and is being tested on UnrealIRCD.


