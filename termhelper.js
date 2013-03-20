/*

	Terminal Helper by EPCIT
	Author: Elijah cowley
	Version: 0.0.9
	Release: Alpha
	Website: http://epcit.biz
	GitHub: https://github.com/greywolf001au/termhelper.git
	IRC Server: irc://irc.epcit.biz:6667
	IRC Nickname: GreyWolf

*/

(function () {
    "use strict";

    var keypress = require('keypress'), thlib = require('./termhelper.lib.js'), util = require('util'), fs = require('fs'), exec = require('child_process').exec, child;

    keypress(process.stdin);

    module.exports = {
        events: {
        	// default event declarations
            before_proc: function (ch, key) { return { ch: ch, key: key }; },
            keypress: function (ch, key) { return { ch: ch, key: key }; },
            line: function (data) { return data; }
        },
        on: function (event, callback) {
        	// method to store events
            this.events[event] = callback;
        },
        set: function (key, val) {
        	// easily change settings
            if (!val && key === 'prompt') { val = ''; }
            if (val) {
                thlib.Settings[key] = val;
            } else {
                var x;
                for (x in key) {
                    if (key.hasOwnProperty(x)) {
                        thlib.Settings[x] = key[x];
                    }
                }
            }
        },
        Prompt: function () {
        	// shortcut to the prompt method
            thlib.Prompt();
        },
        CursorTo: function (pos) {
        	// move the cursor to specified position
            thlib.input.cursor_pos = pos;
            process.stdout.cursorTo(pos);
        },
        CursorPos: function () {
        	// return the current cursor position
            return thlib.input.cursor_pos;
        },
        Clear: function () {
        	// clear terminal screen
            process.stdout.write('\u001B[2J\u001B[0;0f');
            thlib.Prompt();
        },
        ClearLine: function () {
        	// clear current line data
            process.stdout.clearLine();  // clear current text
            thlib.input.cursor_pos = 0;
            thlib.input.string = '';
        },
        Write: function (text) {
        	// write a string to the terminal
            thlib.input.string = thlib.input.string + text;
            thlib.input.cursor_pos += text.length;
            process.stdout.write(text);
			if (thlib.log.level === 1 || thlib.log.level === 3) { exports.log.Write(text); }
        },
        Writeln: function (text) {
        	// write a string to the terminal, append line end character and output prompt
            module.exports.Write(text + thlib.Settings.lineEnd);
            thlib.input.cursor_pos = 0;
            thlib.input.string = '';
            this.CursorTo(0);
            /*this.Prompt();*/
        },
        Run: function (command) {
        	// execute a terminal command
			child = exec(command, // command line argument directly in string
			function (error, stdout, stderr) {      // one easy function to capture data/errors
				process.stdout.write(stdout);
				if (thlib.log.level === 1 || thlib.log.level === 3) {
					exports.log.Write(stdout);
					if (stdout.substr(stdout.length - 2) !== '\r\n' && stdout.substr(stdout.length - 2) !== '\n\r' && stdout.substr(stdout.length - 1) !== '\n' && stdout.substr(stdout.length - 1) !== '\r') {
						exports.log.Write(thlib.Settings.lineEnd);
					}
				}
				if (stderr !== null && stderr !== '') {
					process.stdout.write(stderr.split(':').splice(1, 2).join('').substr(1));
				}
				if (error !== null) {
					//process.stdout.write(error);
				}
           		thlib.input.cursor_pos = 0;
           		thlib.input.string = '';
				module.exports.Prompt();
			});
        },
        Echo: function (data) {
        	var res = '';
        	try {
        		res = eval(data);
        	} catch (ex) {
        		res = data;
        	}
        	this.Writeln(res);
			if (thlib.log.level === 1 || thlib.log.level === 3) { exports.log.Writeln(res); }
        },
        log: {
  	        set: function (key, val) {
	        	// easily change settings
	            if (!val && key === 'path') { val = ''; }
	            if (val) {
	                thlib.log[key] = val;
	            } else {
	                var x;
	                for (x in key) {
	                    if (key.hasOwnProperty(x)) {
	                        thlib.log[x] = key[x];
	                    }
	                }
	            }
	        },
        	Write: function (data, callback) {
        		// create variables
        		var path = thlib.log.path, d = new Date(), file = d.getDate() + '-' + (d.getMonth() + 1) + '-' + d.getFullYear(), prepend = d.toLocaleTimeString() + ": ";
        		// set empty path to current_dir/logs
        		if (path === '') { path = __dirname + '/logs'; }
        		// create non-existant path
        		fs.exists(path, function (exists) {
					if (exists === false) { fs.mkdir(path, thlib.log.dir_mode); }
				});
				// append slash to path string
        		if (path.substr(path.length - 1, 1) !== '/') { path += '/'; }
        		// create log filename based on date
        		if (thlib.log.format === 1) { file = (d.getMonth() + 1) + '-' + d.getDate() + '-' + d.getFullYear(); }
         		if (thlib.log.format === 2) { file = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
         		// add hour to path if hourly set
       			if (thlib.log.hourly === true) { file += '_' + d.getHours(); }
       			// append file extension
       			if (thlib.log.extension.substr(0, 1) !== '.') { file += '.'; }
       			if (thlib.log.extension && thlib.log.extension !== '') { file += thlib.log.extension; }
       			// append data to file
        		fs.appendFile(path + file, prepend + data, function (err) {
					if (err) throw err;
					// execute callback method
					if (callback) { callback(); }
				});
        	},
        	Writeln: function (data, callback) {
        		this.Write(data + thlib.Settings.lineEnd, callback);
        	}
        }
    };

    var exports = module.exports;

    // listen for the "keypress" event
    process.stdin.on('keypress', function (ch, key) {
    	var prompt = true;
    	
        if (thlib.Settings.debug === true) { console.log(key); }

		// call before process event handler
        var conproc = exports.events.before_proc(ch, key), ostra = [], newstr = '', ostr = '';

		// run command processor providing false was not returned from before_proc event handler
        if (conproc !== false && key && key.name === 'enter') {
        	// process enter key
            thlib.input.string += ch; // append character to input string
            thlib.input.cursor_pos += 1; // increment cursor position
            if (thlib.Settings.termHistory === true) {
            	// store input history
                thlib.input.history.push(thlib.input.string);
                thlib.input.history_position = thlib.input.history.length - 1;
            }
            // remove line end character
            if (thlib.input.string.substr(thlib.input.string.length - 1, 1) === '\r') { thlib.input.string = thlib.input.string.substr(0, thlib.input.string.length - 1); }
            if (thlib.Settings.debug === true) { console.log(thlib.input.string); } // output debug message
			if (thlib.log.level === 2 || thlib.log.level === 3) { exports.log.Writeln(thlib.input.string); }
			
            if (thlib.Settings.appendEndChar === true) { thlib.input.string += thlib.Settings.lineEnd; } // append line end character from settings
            process.stdout.write(thlib.Settings.lineEnd); // output line end character to terminal
            //thlib.input.cursor_pos = 0; // set cursor position to 0
            exports.CursorTo(0); // set cursor position to 0
            
           	if (thlib.Settings.allowRun === true && thlib.input.string.substr(0, thlib.Settings.runAlias.length) === thlib.Settings.runAlias) {
           		// execute command in terminal
           		prompt = false;
           		var cmd = thlib.input.string.substr(thlib.Settings.runAlias.length);
           		if (cmd.substr(0, 1) === ' ') { cmd = cmd.substr(1); }
				if (thlib.Settings.appendEndChar === true) { cmd.replace(thlib.Settings.lineEnd, ''); }
           		exports.Run(cmd);
           		//module.exports.Prompt(); // output prompt (commented as it appears on the first line of output)
           	} else if (thlib.input.string.substr(0, 4) === 'echo') {
           		// echo runs javascript eval on string and outputs result to terminal
           		var cmd = thlib.input.string.substr(5);
           		if (cmd.substr(0, 1) === ' ') { cmd = cmd.substr(1); }
           		exports.Echo(cmd);
           	}
           	
           	// fire line event handler
            exports.events.line(thlib.input.string);
            
            thlib.input.string = ''; // reset input string
            if (prompt !== false) { exports.Prompt(); }
        } else if (conproc !== false && key && key.name === 'up' && thlib.input.history_position > -1) {
        	// scroll back through command history
            if (thlib.Settings.termHistory === true) {
                process.stdout.clearLine();  // clear current text
                thlib.input.cursor_pos = 0;
                process.stdout.cursorTo(0);
                exports.Prompt();
                if (thlib.input.history_position < thlib.input.history.length && thlib.input.history_position > -1) {
                    process.stdout.write(thlib.input.history[thlib.input.history_position].substr(0, thlib.input.history[thlib.input.history_position].length - 1));
                    thlib.input.string = thlib.input.history[thlib.input.history_position].substr(0, thlib.input.history[thlib.input.history_position].length - 1);
                    thlib.input.cursor_pos += thlib.input.string.length;
                }
                if (thlib.input.history_position > 0) { thlib.input.history_position -= 1; }
            }
        } else if (conproc !== false && key && key.name === 'down' && thlib.input.history_position < thlib.input.history.length) {
        	// scroll forward through command history
            if (thlib.Settings.termHistory === true) {
                process.stdout.clearLine();  // clear current text
                process.stdout.cursorTo(0);
                thlib.input.cursor_pos = 0;
                exports.Prompt();
                if (thlib.input.history_position < thlib.input.history.length - 1) {
                    thlib.input.history_position += 1;
                    process.stdout.write(thlib.input.history[thlib.input.history_position].substr(0, thlib.input.history[thlib.input.history_position].length - 1));
                    thlib.input.string = thlib.input.history[thlib.input.history_position].substr(0, thlib.input.history[thlib.input.history_position].length - 1);
                } else {
                    thlib.input.string = '';
                }
                thlib.input.cursor_pos += thlib.input.string.length;
            }
        } else if (conproc !== false && key && key.name === 'left') {
        	// move back through line input, stops at prompt
            if (thlib.input.cursor_pos > thlib.Settings.prompt.length) { thlib.input.cursor_pos -= 1; }
            process.stdout.cursorTo(thlib.input.cursor_pos);
        } else if (conproc !== false && key && key.name === 'right') {
        	// move forward through line input, stop at end of line
            if (thlib.input.cursor_pos < (thlib.input.string.length + thlib.Settings.prompt.length)) { thlib.input.cursor_pos += 1; }
            process.stdout.cursorTo(thlib.input.cursor_pos);
        } else if (conproc !== false && key && key.name === 'backspace') {
        	// delete the character behind the cursor from line input
            if (thlib.input.cursor_pos > thlib.Settings.prompt.length) {
                process.stdout.clearLine();  // clear current text
                process.stdout.cursorTo(0);
                thlib.input.cursor_pos -= thlib.Settings.prompt.length;
                exports.Prompt();
                ostra = thlib.input.string.split('');
                ostra.splice((thlib.input.cursor_pos - thlib.Settings.prompt.length) - 1, 1);
                newstr = ostra.join('');
                thlib.input.string = newstr;
                thlib.input.cursor_pos -= 1;
                if (thlib.Settings.echoKeys === true) { process.stdout.write(thlib.input.string); }
                process.stdout.cursorTo(thlib.input.cursor_pos);
            }
        } else if (conproc !== false && key && key.name === 'delete') {
        	// delete the character infront of cursor from line input
            if (thlib.input.cursor_pos > thlib.Settings.prompt.length-1) {
                process.stdout.clearLine();  // clear current text
                process.stdout.cursorTo(0);
                thlib.input.cursor_pos -= thlib.Settings.prompt.length;
                exports.Prompt();
                ostra = thlib.input.string.split('');
                ostra.splice((thlib.input.cursor_pos - thlib.Settings.prompt.length), 1);
                newstr = ostra.join('');
                thlib.input.string = newstr;
                //thlib.input.cursor_pos -= 1;
                if (thlib.Settings.echoKeys === true) { process.stdout.write(thlib.input.string); }
                process.stdout.cursorTo(thlib.input.cursor_pos);
            }
        } else if (conproc !== false && key && key.name === 'end') {
        	exports.CursorTo(thlib.input.string.length + thlib.Settings.prompt.length);
        } else if (conproc !== false && key && key.name === 'home') {
        	exports.CursorTo(thlib.Settings.prompt.length);
        } else if (conproc !== false && key && key.ctrl === true && key.name === 'c' && thlib.Settings.allowKill === true) {
        	// kill application (CTRL+C)
        	process.stdout.write(thlib.Settings.lineEnd);
			if (thlib.log.level === 2 || thlib.log.level === 3) { exports.log.Writeln("Application terminated", function () { process.exit(); }); }
            //process.exit();
        } else if (conproc !== false && ch) {
        	// append character to input string
        	
            //thlib.input.string += ch;
            ostr = thlib.input.string;
            if (thlib.input.cursor_pos < (thlib.Settings.prompt.length + thlib.input.string.length)) {
                thlib.input.string = [ostr.slice(0, thlib.input.cursor_pos - thlib.Settings.prompt.length), ch, ostr.slice(thlib.input.cursor_pos - thlib.Settings.prompt.length)].join('');
            } else {
                thlib.input.string += ch;
            }
            thlib.input.cursor_pos += 1;
            if (thlib.Settings.echoKeys) { //process.stdout.write(ch);
                process.stdout.clearLine();  // clear current text
                process.stdout.cursorTo(0);
                thlib.input.cursor_pos -= thlib.Settings.prompt.length;
                exports.Prompt();
                process.stdout.write(thlib.input.string);
                process.stdout.cursorTo(thlib.input.cursor_pos);
            }
        }
        
        // process keypress events
        conproc = exports.events.keypress(ch, key);
    });

	// this command allows processing of keystrokes
    process.stdin.setRawMode(true);

    // Resume STDIN allows terminal input
    process.stdin.resume();
}());
