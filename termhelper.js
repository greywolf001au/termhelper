/*

	Terminal Helper by EPCIT
	Author: Elijah cowley
	Version: 0.1.1
	Release: Beta
	Website: http://epcit.biz
	GitHub: https://github.com/greywolf001au/termhelper.git
	IRC Server: irc://irc.epcit.biz:6667
	IRC Nickname: GreyWolf

*/

(function () {
    "use strict";

    var keypress = require('keypress'), thlib = require('./termhelper.lib.js'), util = require('util'), fs = require('fs'), exec = require('child_process').exec, app = {}, child;

    keypress(process.stdin);

    module.exports = {
    	lib: thlib,
        events: {
        	// default event declarations
            before_proc: function (ch, key) { return { ch: ch, key: key }; },
            keypress: function (ch, key) { return { ch: ch, key: key }; },
            line: function (data) { return false; }
        },
        on: function (event, callback) {
        	// method to store events
            this.events[event] = callback;
        },
        set: function (section, key, val) {
        	// easily change settings
        	var s = {};
        	if (section) { s = section; }
        	if (!section || section === null || section === '') { s = 'settings'; }
        	
            if (!val && key === 'prompt') { val = ''; }
            if (val) {
                thlib[s][key] = val;
            } else {
                var x;
                for (x in key) {
                    if (key.hasOwnProperty(x)) {
                        thlib[s][x] = key[x];
                    }
                }
            }
        },
        getPrompt: function () {
        	// create the prompt string
		  	var p = thlib.settings.prompt;
		  	var d = new Date();
		  	// replace terminal variable identifiers
		  	p = p.replace('%d', this.formatDate(thlib.settings.date_format, thlib.settings.date_splitter));
		  	p = p.replace('%p', __dirname);
		  	p = p.replace('%t', d.toLocaleTimeString());
		  	p = p.replace('%!', thlib.input.history_position);
		  	p = p.replace('%#', thlib.input.history.length);
		  	try {
		  		p = eval(p);
		  	} catch (ex) {
		  	}
		  	return p;
        },
        Prompt: function () {
        	// display prompt in terminal
			var p = this.getPrompt();
		    process.stdout.write(p);
		    thlib.input.cursor_pos += p.length;

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
        	if (typeof(text) === 'string' || typeof(text) === 'number') {
            	module.exports.Write(text + thlib.settings.lineEnd);
            } else {
            	try {
            		// try to evaluate input text as JavaScript
            		this.Write(eval(text) + thlib.settings.lineEnd);
            		/*
            		// to output text as an object uncomment this code (remove /* style comment) and comment the line above that reads:
            		// this.write(eval(text) + thlib.settings.lineEnd);
            		var out = '{' + thlib.settings.lineEnd;
            		for (var x in text) {
            			out += '\t' + x + ': ' + text[x] + thlib.settings.lineEnd;
            		}
            		out += '}' + thlib.settings.lineEnd;
            		this.Write(out);
            		*/
            	} catch (ex) {
            		this.Write(text + thlib.settings.lineEnd);
            	}
            }
            thlib.input.cursor_pos = 0;
            thlib.input.string = '';
            this.CursorTo(0);
            return false;
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
						exports.log.Write(thlib.settings.lineEnd);
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
        formatDate: function (format, splitter) {
        	var f = thlib.settings.date_format, d = new Date(), s = '/', r = '';
         	if (format) { f = format; }
        	if (splitter) { s = splitter; }
       	switch (f) {
        		case 1: r = (d.getMonth() + 1) + s + d.getDate() + s + d.getFullYear(); break
        		case 2: r = d.getFullYear() + s + (d.getMonth() + 1) + s + d.getDate(); break
        		default: r = d.getDate() + '-' + (d.getMonth() + 1) + s + d.getFullYear();
        	}
         	return r;
        },
        log: {
  	        set: function (key, val) {
	        	// change log settings
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
        		var path = thlib.log.path, d = new Date(), file = thlib.log.filename + exports.formatDate(thlib.log.date_format, thlib.log.date_splitter), prepend = d.toLocaleTimeString() + ": ";
        		// set empty path to current_dir/logs
        		if (path === '') { path = __dirname + '/logs'; }
        		// create non-existant path
        		fs.exists(path, function (exists) {
					if (exists === false) { fs.mkdir(path, thlib.log.dir_mode); }
				});
				// append slash to path string
        		if (path.substr(path.length - 1, 1) !== '/') { path += '/'; }
         		
         		// add hour to path if hourly set
       			if (thlib.log.hourly === true) { file += '_' + d.getHours(); }
       			// append file extension
       			if (thlib.log.extension.substr(0, 1) !== '.') { file += '.'; }
       			if (thlib.log.extension && thlib.log.extension !== '') { file += thlib.log.extension; }
       			// append data to file
       			if (!thlib.log.timestamp || thlib.log.timestamp === false) { prepend = ''; }
        		fs.appendFile(path + file, prepend + data, function (err) {
					if (err && thlib.settings.error_level === 3) { throw err; }
					//if (err && thlib.settings.error_level === 2) { exports.Writeln(err); }
					//if (err && thlib.settings.error_level === 1) { exports.log.Writeln(err); }
					// execute callback method
					if (callback) { callback(); }
				});
        	},
        	Writeln: function (data, callback) {
        		this.Write(data + thlib.settings.lineEnd, callback);
        	}
        }
    };

    var exports = module.exports;

    // listen for the "keypress" event
    process.stdin.on('keypress', function (ch, key) {
    	var prompt = true;
    	
        if (thlib.settings.debug === true) { console.log(key); }

		// call before process event handler
        var conproc = exports.events.before_proc(ch, key), ostra = [], newstr = '', ostr = '';

		// run command processor providing false was not returned from before_proc event handler
        if (conproc !== false && (!conproc.enter && conproc.enter !== false) && key && key.name === 'enter') {
        	// process enter key
            thlib.input.cursor_pos += 1; // increment cursor position
            if (thlib.settings.termHistory != 0 && thlib.input.history[thlib.input.history.length - 1] !== thlib.input.string) {
            	// store input history
                thlib.input.history.push(thlib.input.string);
            }
            
            if (thlib.settings.termHistory > 0 && thlib.input.history.length > thlib.settings.termHistory) {
            	// remove first history entry if we are at the maximum allowed
            	thlib.input.history.splice(0, 1)
            }
            thlib.input.history_position = thlib.input.history.length;
                        
            if (thlib.settings.debug === true) { console.log(thlib.input.string); } // output debug message
			if (thlib.log.level === 2 || thlib.log.level === 3) { exports.log.Writeln(thlib.input.string); }
			
            if (thlib.settings.appendEndChar === true) { thlib.input.string += thlib.settings.lineEnd; } // append line end character from settings
            process.stdout.write(thlib.settings.lineEnd); // output line end character to terminal
            //thlib.input.cursor_pos = 0; // set cursor position to 0
            exports.CursorTo(0); // set cursor position to 0
            
           	if (thlib.settings.allowRun === true && thlib.input.string.substr(0, thlib.alias.run.length) === thlib.alias.run) {
           		// execute command in terminal
           		prompt = false;
           		var cmd = thlib.input.string.substr(thlib.alias.run.length);
           		if (cmd.substr(0, 1) === ' ') { cmd = cmd.substr(1); }
				if (thlib.settings.appendEndChar === true) { cmd.replace(thlib.settings.lineEnd, ''); }
           		exports.Run(cmd);
           		//module.exports.Prompt(); // output prompt (commented as it appears on the first line of output)
           	} else if (thlib.input.string.substr(0, thlib.alias.echo.length) === thlib.alias.echo) {
           		// echo runs javascript eval on string and outputs result to terminal
           		var cmd = thlib.input.string.substr(thlib.alias.echo.length + 1);
           		if (cmd.substr(0, 1) === ' ') { cmd = cmd.substr(1); }
           		exports.Echo(cmd);
           	} else if (thlib.input.string.substr(0, thlib.alias.prompt.length) === thlib.alias.prompt) {
           		// echo runs javascript eval on string and outputs result to terminal
           		var cmd = thlib.input.string.substr(thlib.alias.prompt.length + 1);
           		if (cmd.substr(0, 1) === ' ') { cmd = cmd.substr(1); }
           		//try {
           		//	exports.set('settings', 'prompt', eval(cmd));
           		//} catch (ex) {
           			exports.set('settings', 'prompt', cmd);
           		//}
           	} else if (thlib.input.string.substr(0, thlib.alias.exit.length) === thlib.alias.exit) {
           		// exit application
           		prompt = false;
				if (thlib.log.level === 2 || thlib.log.level === 3) { exports.log.Writeln("Application exit", function () { process.exit(); }); }
            } else if (thlib.input.string === '' || thlib.input.string === thlib.settings.lineEnd) {
          	} else {
        	   	// fire line event handler
    	        var r = exports.events.line(thlib.input.string);
    	        if ((typeof(r) === 'boolean' && r === false) || (typeof(r) === 'object' && r.valid && r.valid === false)) {
    	        	exports.Writeln('Invalid command [' + thlib.input.string + ']');
    	        }
    	        if (typeof(r) === 'object' && r.prompt && r.prompt === false) {
    	        	prompt = false;
    	        }
           	}
            
            thlib.input.string = ''; // reset input string
            if (prompt !== false) { exports.Prompt(); }
        } else if (conproc !== false && (!conproc.up && conproc.up !== false) && key && key.name === 'up' && thlib.input.history_position > -1) {
        	// scroll back through command history
            if (thlib.settings.termHistory !== 0) {
                process.stdout.clearLine();  // clear current text
                thlib.input.cursor_pos = 0;
                process.stdout.cursorTo(0);
                if (thlib.input.history_position > 0) { thlib.input.history_position -= 1; }
                exports.Prompt();
                if (thlib.input.history_position < thlib.input.history.length && thlib.input.history_position > -1) {
                    process.stdout.write(thlib.input.history[thlib.input.history_position].substr(0, thlib.input.history[thlib.input.history_position].length));
                    thlib.input.string = thlib.input.history[thlib.input.history_position].substr(0, thlib.input.history[thlib.input.history_position].length);
                    thlib.input.cursor_pos += thlib.input.string.length;
                }
            }
        } else if (conproc !== false && (!conproc.down && conproc.down !== false) && key && key.name === 'down' && thlib.input.history_position < thlib.input.history.length) {
        	// scroll forward through command history
            if (thlib.settings.termHistory !== 0) {
                process.stdout.clearLine();  // clear current text
                process.stdout.cursorTo(0);
                thlib.input.cursor_pos = 0;
                    thlib.input.history_position += 1;
                exports.Prompt();
                if (thlib.input.history_position <= thlib.input.history.length - 1) {
                    process.stdout.write(thlib.input.history[thlib.input.history_position].substr(0, thlib.input.history[thlib.input.history_position].length));
                    thlib.input.string = thlib.input.history[thlib.input.history_position].substr(0, thlib.input.history[thlib.input.history_position].length);
                } else {
                    thlib.input.string = '';
                }
                thlib.input.cursor_pos += thlib.input.string.length;
            }
        } else if ((conproc !== false && !conproc.left && conproc.left !== false) && key && key.name === 'left') {
      		// move back through line input, stops at prompt
           	if (thlib.input.cursor_pos > exports.getPrompt().length) { thlib.input.cursor_pos -= 1; }
           	process.stdout.cursorTo(thlib.input.cursor_pos);
        } else if (conproc !== false && (!conproc.right && conproc.right !== false) && key && key.name === 'right') {
        	// move forward through line input, stop at end of line
            if (thlib.input.cursor_pos < (thlib.input.string.length + exports.getPrompt().length)) { thlib.input.cursor_pos += 1; }
            process.stdout.cursorTo(thlib.input.cursor_pos);
        } else if (conproc !== false && (!conproc.backspace && conproc.backspace !== false) && key && key.name === 'backspace') {
        	// delete the character behind the cursor from line input
            if (thlib.input.cursor_pos > exports.getPrompt().length) {
                process.stdout.clearLine();  // clear current text
                process.stdout.cursorTo(0);
                thlib.input.cursor_pos -= exports.getPrompt().length;
                exports.Prompt();
                ostra = thlib.input.string.split('');
                ostra.splice((thlib.input.cursor_pos - exports.getPrompt().length) - 1, 1);
                newstr = ostra.join('');
                thlib.input.string = newstr;
                thlib.input.cursor_pos -= 1;
                if (thlib.settings.echoKeys === true) { process.stdout.write(thlib.input.string); }
                process.stdout.cursorTo(thlib.input.cursor_pos);
            }
        } else if (conproc !== false && (!conproc.delete && conproc.delete !== false) && key && key.name === 'delete') {
        	// delete the character infront of cursor from line input
            if (thlib.input.cursor_pos > exports.getPrompt().length-1) {
                process.stdout.clearLine();  // clear current text
                process.stdout.cursorTo(0);
                thlib.input.cursor_pos -= exports.getPrompt().length;
                exports.Prompt();
                ostra = thlib.input.string.split('');
                ostra.splice((thlib.input.cursor_pos - exports.getPrompt().length), 1);
                newstr = ostra.join('');
                thlib.input.string = newstr;
                //thlib.input.cursor_pos -= 1;
                if (thlib.settings.echoKeys === true) { process.stdout.write(thlib.input.string); }
                process.stdout.cursorTo(thlib.input.cursor_pos);
            }
        } else if (conproc !== false && (!conproc.end && conproc.end !== false) && key && key.name === 'end') {
        	exports.CursorTo(thlib.input.string.length + exports.getPrompt().length);
        } else if (conproc !== false && (!conproc.home && conproc.home !== false) && key && key.name === 'home') {
        	exports.CursorTo(exports.getPrompt().length);
        } else if (conproc !== false && (!conproc.kill && conproc.kill !== false) && key && key.ctrl === true && key.name === 'c' && thlib.settings.allowKill === true) {
        	// kill application (CTRL+C)
        	process.stdout.write(thlib.settings.lineEnd);
			if (thlib.log.level === 2 || thlib.log.level === 3) { exports.log.Writeln("Application killed", function () { process.exit(); }); }
            //process.exit();
        } else if (conproc !== false && ch) {
        	// append character to input string
        	
            //thlib.input.string += ch;
            ostr = thlib.input.string;
            if (thlib.input.cursor_pos < (exports.getPrompt().length + thlib.input.string.length)) {
                thlib.input.string = [
                	ostr.slice(0, thlib.input.cursor_pos - exports.getPrompt().length), ch, ostr.slice(thlib.input.cursor_pos - exports.getPrompt().length)
                ].join('');
            } else {
                thlib.input.string += ch;
            }
            thlib.input.cursor_pos += 1;
            if (thlib.settings.echoKeys) {
                process.stdout.clearLine();  // clear current text
                process.stdout.cursorTo(0);
                thlib.input.cursor_pos -= exports.getPrompt().length;
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
