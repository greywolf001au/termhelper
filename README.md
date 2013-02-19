
	Terminal Helper
	Version: 0.0.1
	Author: Elijah Cowley
	Website: http://epcit.biz

This module is designed to allow both keypress and string event firing and includes some helper methods for terminal commands.
Tested on Debian Linux, please contact ecowley@epcit.biz to report bugs using this modules.


** Install

Install this module using NPM or copy the package to your applications '/node_modules' directory.



** Useage

In your application files where you would like to use this module add the following line:

	var term = require('termHelper')



** Settings

Available Settings:
     Setting		|	Default Value  |	    Description		|
---------------------------------------------------------------------------------
    echoKeys			    true	     Outputs key on key stroke
    prompt			    '> '	     Sets the prompt string
    termHistory			    true	     Keep command history
    allowKill			    true	     Allow CTRL + C to kill app
    lineEnd			    '\n'	     Line end charater to use


Settings can be modified using the following lines:

	term.set('prompt', 'value');



** Processed Keys

        Key		|	Default Function	|
---------------------------------------------------------
     UP Arrow		   Scroll back through history
     Down Arrow		 Scroll forward through history 
     Left Arrow                 Move cursor back
     Right Arrow	      Move cursor forward
      Backspace		  Delete last character typed
        Enter		         Process line
       CTRL+C			Exit application



** Events

Events can be set for a single keypress and on line data using the following:

	term.on('keypress', function(ch, key) {
		Add your code here....
	}

	term.on('line', function(data) {
		Add your code here....
	}

Default key press processing can be bypassed by returning false from your event handler.
Example:
	term.on('keypress', function(ch, key) {
		Add your code here....
		if (data == somedata) return false;
	}

Note: bypassing command processing will cause all key press events to be bypassed including enter and CTRL+C, future versions will allow bypass of individual keystrokes



** Available Methods

Several methods have been added to make working in the terminal easier

	Method		|	Useage		|		    Description			|
-------------------------------------------------------------------------------------------------
	Clear		     term.Clear()			Clear terminal window
        Prompt		     term.Prompt()	   		Output prompt string
        Write		    term.Write(text)			Send text to terminal
	Writeln		    term.Writeln(text)	  	Send text to terminal with line end
	CursorPos	    term.CursorPos()	    Returns an integer denoting cursor position



** Changes For Future Versions

1) Bypassing events will be changed to allow selection of key events to bypass.

2) Currently the default enter keystroke outputs '\r' which is overriden to output '\n', this will be changed to use the lineEnd setting.

3) Make this a standalone module without requirement of keypress module.

4) Basic code cleanup and bug fixes.

5) Possibly add string colouring and styles.



** Complimentary Modules

Colors module will allow terminal colors and styles however this library extends the String prototype. While it works quite nicely it is not the preferable method.



** Other Projects

Node.js IRC Client, this application has the alias NoIRC and will be made available soon.
NoIRC allows browser connections to an IRC server.
This project is still in development and is being tested on UnrealIRCD.

