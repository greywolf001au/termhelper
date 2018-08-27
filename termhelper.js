/*

	Terminal Helper by EPCIT
	Author: Elijah cowley
	Version: 1.1.0
	Release: Beta
	Website: http://au.epcit.biz
	GitHub: https://github.com/greywolf001au/termhelper.git

*/

(function () {
    "use strict";

    const __NAME = "termhelper";
    const __VERSION = "1.1.0";
    const __AUTHOR = "Elijah Cowley";
    const __WEBSITE = "https://au.epcit.biz";

    const { Duplex } = require('stream');
    var session_key = Math.floor(Math.random() * 10000);
    var haltAll = false, keypress = require('keypress'), app = {}, child,
        util = require('util'), fs = require('fs'), exec = require('child_process'), readline = require('readline')
    global['thlib'] = require('./termhelper.conf.js'), global['locale'] = require(thlib.settings.locale_path + '/' + thlib.settings.locale + '.lib.js');

    keypress(process.stdin);
    //process.stdin.pipe = process.stdin.pipe.bind(function (binding) { keypress(binding); });

    // Add the unixTime method to the Date object
    Date.prototype.getUnixTime = function () { return this.getTime() / 1000 | 0 };
    Date.prototype.setUnixTime = function (timestamp) { this.setTime(Math.floor(parseInt(timestamp) * 1000)); return this; };
    Date.now = function () { return new Date(); }
    Date.prototype.time = function () { return Date.now().getUnixTime(); }

    module.exports = {
        module: {
          name: __NAME,
          version: __VERSION,
          author: __AUTHOR,
          website: __WEBSITE,
        },
        console: 'default',
        Choice: thChoice,
        KEY: 0,
        LINE: 1,
        STARTED: new Date().getUnixTime(),
        argc: process.argv[0],
        argv: aSplice(process.argv, 0, 1),
        stdio: [process.stdin, process.stdout, process.stderr],
        stdin: {}, stdout: {}, stderr: {},
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
        set: function (section = null, key = {}, val = null) {
            // you can 
            if (haltAll === true) return;
            // easily change settings
            var s = {};
            if (section) { s = section; }
            if (!section || section === null || section === '') { s = 'settings'; }
            if (s === 'settings' && key === 'conf_path') {
                if (val !== null && fs.existsSync(val)) {
                    try {
                        var temp_conf = require(val);
                        for (var x in temp_conf) {
                            for (var k in temp_conf[x]) {
                                if (thlib.hasOwnProperty(x) && thlib[x].hasOwnProperty(k)) {
                                    thlib[x][k] = temp_conf[x][k];
                                }
                            }
                        }
                    } catch (ex) {
                        term.writeln('Error loading configuration file: ' + ex);
                    }
                }
            } else {

                if (!val && key === 'prompt') { val = ''; }
                if (val !== null) {
                    if (s === 'locale') {
                        locale[key] = val;
                    } else {
                        thlib[s][key] = val;
                        if (key === 'locale') { locale = require(thlib.settings.locale_path + '/' + thlib.settings.locale + '.lib.js'); }
                    }
                } else {
                    var x;
                    for (x in key) {
                        if (key.hasOwnProperty(x)) {
                            if (s === 'locale') {
                                locale[x] = key[x];
                            } else {
                                thlib[s][x] = key[x];
                                if (x === 'locale') { locale = require(thlib.settings.locale_path + '/' + thlib.settings.locale + '.lib.js'); }
                                if (s === 'settings' && x === 'use_xconsole') xconsole.hijack(key[x]);
                            }
                        }
                    }
                }
            }
        },
        get: function (section = null, key = '') {
            if (haltAll === true) return;
            // easily get settings
            if (!section || section === null || section === '') { section = 'settings'; }

            if (key !== null) {
              if (section === 'locale') {
                return locale[key];
              } else {
                return thlib[section][key];
              }
            } else {
                return thlib[section];
            }
        },
        replaceVars: function (s) {
            var p = thlib.settings.prompt;
            var d = new Date();
            var path = __dirname;
            for (var gl in thlib.globalVars) {
                try {
                    var g = thlib.globalVars[gl];
                    if (gl.indexOf('*') > -1) gl = gl.replace(/\*/g, '\\*');
                    if (g.indexOf("'") > -1) g = g.replace(/\'/g, "\\'");
                    if (g.indexOf('"') > -1) g = g.replace(/\"/g, '\\"');
                    if (g === '') g = "''";
                    var es = 's = s.replace(/' + gl + '(?![A-Za-z0-9])/gm, ' + g + ')';
                    //console.log(es);
                    eval(es);
                } catch (e) {
                    var msg = 'Unable to evaluate global variable [' + gl + ']'
                    if (thlib.settings.debug === true) throw new SyntaxError(msg + thlib.settings.lineEndOut + e);
                    else this.writeln(msg);
                }
            }
            return s;
        },
        getPrompt: function () {
            // create the prompt string
            if (haltAll === true) return '';
            var p = thlib.settings.prompt;
            if (p !== null && p !== '') {
                var d = new Date();
                var path = __dirname;
                try {
                    // TODO: Add thlib.path variable and fs pass through
                } catch (ex) { }
                // replace terminal variable identifiers
                if (thlib.alias.hasOwnProperty('clock') === false) thlib.alias['clock'] = '%*';
                if (thlib.hasOwnProperty('temp') === false) thlib['temp'] = {};
                if (thlib.temp.hasOwnProperty('clock') === false && p.indexOf(thlib.alias.__clock) > -1) this.startClock();
                else if (thlib.temp.hasOwnProperty('clock') === false && p.indexOf(thlib.alias.__clock) === -1) this.stopClock();
                p = exports.replaceVars(p);
                try {
                    p = eval(p);
                } catch (ex) {
                    //console.log(ex);
                }
            } else {
                p = '';
            }
            return p;
        },
        updatePrompt: function () {
          if (haltAll === true) return;
          var inp = thlib.input.string; //.replace(thlib.temp.prompt, '');
          var p = this.getPrompt();
          //if (p && p !== null && p !== '') {
              var t = thlib.input.cursor_pos;
              var tl = 0; if (thlib.temp.hasOwnProperty('prompt')) tl = thlib.temp.prompt.length;
              //inp = inp.replace(thlib.temp.lastPrompt, '');
              exports.clearLine(); // <- use exports as this is run privately from the timer and this.clearLine etc are unrecognised
              exports.cursorTo(0);
              // display prompt in terminal
              if (p && p !== null && p !== '') {
                  exports.stdout.write(p);
              }
              thlib.input.string = inp;
              exports.stdout.write(inp);
              //thlib.input.cursor_pos = ; // put the cursor back where it was not at the end of the input
              thlib.temp.lastPrompt = thlib.temp.prompt;
              thlib.temp.prompt = p;
              exports.cursorTo((t - tl) + p.length);
          //}
        },
        counterFormat: function(uTime=0) {
          var T = parseInt(uTime);
          //if (uTime === null) T = new Date().getUnixTime();
          var time = "";
          var Y = Math.floor(T / 60 / 60 / 24 / 365),
           M = Math.floor(T / 60 / 60 / 24 / 365 % 12),
           D = Math.floor(T / 60 / 60 / 24 % 365),
           H = Math.floor(T / 60 / 60 % 24),
           I = Math.floor(T / 60 % 60), S = Math.floor(T % 60);
          var yearsRemainder = T % 31536000;
          //D = Math.floor(yearsRemainder / 86400);
          var daysRemainder = T % 86400;
          H = Math.floor(daysRemainder / 3600);
          var hourRemainder = Math.floor((T - 86400) % 3600);
          if (Y > 0) time += Y.toString() + " year" + (Y > 1 ? "s " : " ");
          if (D === 0 && M > 0) time += M.toString() + ' month' + (M > 1 ? "s " : " ");
          if (D > 0) time += D.toString() + ' day' + (D > 1 ? "s " : " ");
          if (H > 0) time += H.toString() + ' hour' + (H > 1 ? "s " : " ");
          if (I > 0) time += I.toString() + ' minute' + (I > 1 ? "s " : " ");
          time += S.toString() + ' second' + (S > 1 ? "s" : "");
          return time;
        },
        startClock: function() {
          if (haltAll === true) return;
          if (thlib.hasOwnProperty('temp') === false) thlib['temp'] = {};
          var int = 60000;
          if (thlib.settings.hasOwnProperty('clockUpdateInterval') === true) int = thlib.settings.clockUpdateInterval;
          thlib.temp['clock'] = setInterval(function() { exports.updatePrompt(); }, int);
        },
        stopClock: function() {
          if (haltAll === true) return;
          if (thlib.hasOwnProperty('temp') === false) thlib['temp'] = {};
          if (thlib.temp.hasOwnProperty('clock') === true) {
            clearTimeout(thlib.temp['clock']);
            delete(thlib.temp.clock);
          }
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
        prompt: function () {
            if (haltAll === true) return;
  	        // display prompt in terminal
            var p = this.getPrompt();
            var pl = 0; (p !== null) ? pl = p.length : pl = 0;
  	        //if (p && p !== null && p !== '') {
                if (thlib.hasOwnProperty('temp') === false) thlib['temp'] = {};
                if (thlib.temp.hasOwnProperty('prompt') === false) thlib.temp['prompt'] = p;
                thlib.temp.lastPrompt = thlib.temp.prompt;
                thlib.temp.prompt = p;
  	            exports.stdout.write(p);
                thlib.input.cursor_pos += p.length;
            //} else {
                //thlib.input.cursor_pos = thlib.input.string.length;
                //exports.cursorTo(thlib.input.cursor_pos);
                //exports.cursorTo(thlib.input.string.length + pl);
            //}
            thlib.temp.line.start = pl;
        },
        cursorTo: function (x, y=null) {
            if (haltAll === true) return;
            if (x !== null) {
                // move the cursor to specified position
                thlib.input.cursor_pos = x;
            }
            readline.cursorTo(exports.stdout, thlib.input.cursor_pos, y);
        },
        cursorPos: function () {
            // return the current cursor position
            return thlib.input.cursor_pos;
        },
        clear: function (prompt) {
            if (haltAll === true) return;
            // clear terminal screen
            exports.stdout.write('\u001B[2J\u001B[0;0f');
            if ((prompt && (prompt === null || prompt === true)) && thlib.settings.prompt !== null && thlib.settings.prompt !== '') { module.exports.prompt(); }
            //exports.cursorTo(0);
        },
        clearLine: function () {
            if (haltAll === true) return;
            // clear current line data
            try {
                exports.stdout.clearLine();  // clear current text
            } catch (e) {}
            thlib.input.string = '';
            exports.cursorTo(0);
        },
        write:  function (text) {
            if (haltAll === true) return;
            // write a string to the terminal
            //var ls = 0, cl = thlib.input.string.length;
            text = exports.replaceVars(text);
            thlib.input.string = thlib.input.string + text.toString();
            //try { var ts = exports.getPrompt().length; (ts > 0) ? ls = ts : ls = 0;  } catch (ex){}
            //exports.cursorTo(ts + cl);
            exports.stdout.write(text.toString());
            thlib.input.cursor_pos + text.toString().length;
            if (thlib.log.level === 1 || thlib.log.level === 3) { exports.log.write(text); }
        },
        writeln: function (text) {
            if (haltAll === true) return;
            // write a string to the terminal, append line end character and output prompt
            if (typeof(text) === 'string' || typeof(text) === 'number') {
              this.write(text + thlib.settings.lineEndOut);
            } else {
              try {
                // try to evaluate input text as JavaScript
                this.write(eval(text) + thlib.settings.lineEndOut);
              } catch (ex) {
                this.write(text + thlib.settings.lineEndOut);
              }
            }
            thlib.input.string = '';
            thlib.input.cursor_pos = 0;
            this.cursorTo(0);
            return false;
        },
        echo: function (text) {
            if (haltAll === true) return;
            // write a string to the terminal, append line end character and output prompt
            if (typeof(text) === 'string' || typeof(text) === 'number') {
              this.write(text + thlib.settings.lineEndOut);
            } else {
              try {
                // Output object as text
                var out = '{' + thlib.settings.lineEndOut;
                var t = '';
                for (var x in text) {
                  t = text[x];
                  if (t === '\r') t = '\\r';
                  else if (t === '\n') t = '\\n';
                  else if (t === '\r\n') t = '\\r\\n';
                  else if (t === '\n\r') t = '\\n\\r';
                  out += '\t' + x + ': ' + t + thlib.settings.lineEndOut;
                }
                out += '}' + thlib.settings.lineEndOut;
                this.write(out);
              } catch (ex) {
                this.write(text + thlib.settings.lineEndOut);
              }
            }
            //thlib.input.cursor_pos = 0;
            thlib.input.string = '';
            this.cursorTo(0);
            return '';
        },
        run: function (command, echo=true, callback = function(err, data=true) { return data; }) {
            if (haltAll === true) return;
            // execute a terminal command
            if (command.substr(command.length - 1, 1) === thlib.settings.lineEnd) { command = command.substr(0, command.length - 1); }
            child = exec.exec(command, // command line argument directly in string
            function (error, stdout, stderr) {      // one easy function to capture data/errors
              if (echo === true) console.log(stdout);
              if (thlib.log.level === 1 || thlib.log.level === 3) {
                exports.log.write(stdout);
                if (stdout.substr(stdout.length - 2) !== '\r\n' && stdout.substr(stdout.length - 2) !== '\n\r' && stdout.substr(stdout.length - 1) !== '\n' && stdout.substr(stdout.length - 1) !== '\r') {
                  exports.log.write(thlib.settings.lineEndOut);
                }
              }
              if (echo === true && stderr !== null && stderr !== '') {
                exports.stdout.write(stderr.split(':').splice(1, 2).join('').substr(1));
              }
              exports.cursorTo(0);
              thlib.input.string = '';
              if (echo === true && thlib.settings.prompt !== null && thlib.settings.prompt !== '') { module.exports.prompt(); }
		          return callback(stderr, stdout);
            });
        },
        eval: function (data) {
            // evaluate string as JS
            if (haltAll === true) return;
            var res = '';
            try {
              res = eval(data);
            } catch (ex) {
              res = data;
            }
            this.writeln(res);
            if (thlib.log.level === 1 || thlib.log.level === 3) { exports.log.writeln(res); }
        },
        version: function () {
            // output version information
            return this.module.version;
        },
        show: function (key) {
            // show termhelper info
            if (haltAll === true) return;
            if (key === null) {
              return this.module;
            } else if (key === "") {
              var r = "";
              for (var x in this.module) {
                r += x + ": " + this.module[x] + thlib.settings.lineEndOut;
              }
              r = r.substr(0, r.length - thlib.settings.lineEndOut.length);
              return r;
            } else {
              return this.module[key];
            }
        },
        stripLineEnd: function (str) {
            // strip line end character from single line string
            if (typeof (str) === 'string') {
                if (str.substr(str.length - thlib.settings.lineEndIn.length, thlib.settings.lineEndIn.length) === thlib.settings.lineEndIn) str = str.substr(0, str.length - thlib.settings.lineEndIn.length);
                if (str.substr(str.length - thlib.settings.lineEndOut.length, thlib.settings.lineEndOut.length) === thlib.settings.lineEndOut) str = str.substr(0, str.length - thlib.settings.lineEndOut.length);
            }
          return str;
        },
        choice: function (data={ message: '', options: [], timeout: 5000, default: 0, append: '', type: exports.LINE, callback: function(c,a) { a.next=true; return true; }, args: {}, HIDEOPTS: false }) {
          if (haltAll === true) return;
          if (data.hasOwnProperty('options') === false) throw new Error('No options supplied to choice()')
          if (data.hasOwnProperty('callback') === false) data.callback = function(c, a) { a.next = true; return true; };
          if (data.hasOwnProperty('args') === false) data.args = {};
          if (data.hasOwnProperty('type') === false) data.type = exports.LINE;
          if (data.hasOwnProperty('HIDEOPTS') === false) data.HIDEOPTS = false;
          if (data.hasOwnProperty('append') === false) data.append = '';
          if (data.hasOwnProperty('message') === false) data.message = '[' + data.options.join(',') + ']' + data.append;
          else if (data.hasOwnProperty('message') === true && data.HIDEOPTS === false) data.message += '[' + data.options.join(',') + ']' + data.append;
          if (data.hasOwnProperty('timeout') === false) data.timeout = 5000;
          if (data.hasOwnProperty('default') === false) data.default = data.options[0];
          if (thlib.hasOwnProperty('temp') === false) thlib['temp'] = {};
          data['prompt'] = thlib.settings.prompt;
          thlib.temp['choice'] = data;
          thlib.settings.prompt = data.message;
          this.clearLine();
          exports.cursorTo(0);
          this.prompt();
          if (data.timeout > -1) {
            thlib.temp.choice.timer = setTimeout(function(){
              thlib.settings.prompt = thlib.temp.choice.prompt;
              exports.writeln('');
              exports.clearLine();
              exports.cursorTo(0);
              try {
                var c = thlib.temp.choice.callback(thlib.temp.choice.options[thlib.temp.choice.default], thlib.temp.choice.args);
              } catch (e) {
                throw new Error('An error occurred in the choice callback method supplied');
              }
              delete(thlib.temp.choice);
              //exports.writeln('');
              exports.clearLine();
              exports.cursorTo(0);
              if (c === true) {
                exports.prompt();
              }
              return c;
            }, data.timeout);
          }
        },
        exit: function(message=null, exitCode=0) {
          if (haltAll === true) return;
          if (message === null) message = locale.app.exit;
          this.clearLine();
          exports.cursorTo(0);
          var logLevel = thlib.log.level;
          var logMessage = locale.log.AppExit;
          var obj = { exitCode: exitCode, message: message, logLevel: logLevel, logMessage: logMessage }
          if (thlib.settings.exit) {
              if (typeof (thlib.settings.exit) === 'function') { obj = thlib.settings.exit(obj); }
              else if (typeof (thlib.settings.exit) === 'string') { obj.message = thlib.settings.exit; }
              else if (typeof (thlib.settings.exit) === 'number') { obj.exitCode = thlib.settings.exit; }
              else if (typeof (thlib.settings.exit) === 'object') { obj = thlib.settings.exit; }
          }
          this.writeln(obj.message);
          if (logLevel === 2 || logLevel === 3) { exports.log.writeln(logMessage, function () { process.exit(obj.exitCode); }); }
          else process.exit(obj.exitCode);
        },
        uptime: function() {
          return (new Date().getUnixTime() - this.STARTED);
        },
        startsWithAlias: function(cmd) {
            for (var i in thlib.alias) {
                //exports.writeln(cmd + ' = ' + thlib.alias[i] + ' = ' + (cmd === thlib.alias[i] ? 'true' : 'false'));
                if (cmd.toString().startsWith(thlib.alias[i] + ' ')) return thlib.alias[i];
                else if (cmd.toString() === thlib.alias[i] + thlib.settings.lineEndIn) return thlib.alias[i];
                else if (cmd.toString() === thlib.alias[i] + thlib.settings.lineEndOut) return thlib.alias[i];
                else if (cmd.toString() === thlib.alias[i]) return thlib.alias[i];
            }
            return null;
        },
        log: {
          set: function (key, val) {
              if (haltAll === true) return;
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
          write: function (data, callback) {
              if (haltAll === true) return;
              // create variables
              var path = thlib.log.path, d = new Date(), file = thlib.log.filename + exports.formatDate(thlib.log.date_format, thlib.log.date_splitter), prepend = d.toLocaleTimeString() + ": ";
              // set empty path to current_dir/logs
              if (path === '') { path = __dirname + '/logs'; }
              // create non-existant path
              fs.exists(path, function (exists) {
                try {
                  if (exists === false) { fs.mkdir(path, thlib.log.dir_mode, function(err) {}); }
                } catch (ex) {
                }
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
                if (err !== null && thlib.settings.error_level === 3) { throw err; }
                // execute callback method
                if (callback) { callback(); }
              });
            },
          writeln: function (data, callback) {
              if (haltAll === true) return;
              this.write(data + thlib.settings.lineEndOut, callback);
            },
          write: function (data, callback) {
              if (haltAll === true) return;
              // create variables
              var path = thlib.log.path, d = new Date(), file = thlib.log.filename + exports.formatDate(thlib.log.date_format, thlib.log.date_splitter), prepend = d.toLocaleTimeString() + ": ";
              // set empty path to current_dir/logs
              if (path === '') { path = __dirname + '/logs'; }
              // create non-existant path
              fs.exists(path, function (exists) {
                try {
                  if (exists === false) { fs.mkdir(path, thlib.log.dir_mode, function(err) {}); }
                } catch (ex) {
                }
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
                if (err !== null && thlib.settings.error_level === 3) { throw err; }
                // execute callback method
                if (callback) { callback(); }
              });
            },
          writeln: function (data, callback) {
              if (haltAll === true) return;
            this.write(data + thlib.settings.lineEndOut, callback);
          },
        }
    };

    global['term'] = module.exports;
    var exports = module.exports;
    exports.stdin = exports.stdio[0];
    exports.stdout = exports.stdio[1];
    exports.stderr = exports.stdio[2];

    // temp data store
    thlib['temp'] = {
        line: { start: 0, current_pos: 0 },
        input: { string: '' }
    }
    // set up xconsole and hijack method
    var sconsole = new console.Console(process.stdout);
    var xconsole = console;
    xconsole.Console.prototype.log = function (data) {
        data = exports.stripLineEnd(data);
        var i = thlib.temp.input.string.length, s = thlib.temp.input.string;
        if (s.indexOf('\r') > -1 || s.indexOf('\n') > -1) s = '';
        //if (s !== '') exports.writeln('');
        term.clearLine();
        exports.cursorTo(0);
        sconsole.log(data);
        thlib.temp.input.string = '';
        exports.cursorTo(0);
        var p = exports.getPrompt()
        term.prompt();
        if (i > 0) exports.write(s);
        thlib.temp.input.string = s;
        exports.cursorTo(i + p.length)
        if (thlib.log.level === 1 || thlib.log.level === 3) { exports.log.writeln(data); }
    }
    xconsole.hijack = function (on = true) {
        if (on === true) {
            console.log = new xconsole.Console(process.stdout).log;
            module.exports.console = 'xconsole';
        } else {
            console.log = sconsole.log;
            module.exports.console = 'default';
        }
    }
    if (thlib.settings.hijack_console === true) {
        xconsole.hijack(true);
    }

    // Choice object and helper methods
    function thChoice(message=''||{}, options=[], callback=function(c,a) { a.next=true; return true; }, args={}, type=1) {
        try {
            if (typeof(message) === 'object') {
                this.fromObject(message);
            } else {
                this.message = message, this.options = options;
                this.callback = callback, this.args = args, this.type = type;
                this.default = 0;
            }
        } catch (e) {
        }
    }
    thChoice.prototype.fromObject = function(o) {
        try {
            for (var i in o) {
                if (this.hasOwnProperty(i) === true) this[i] = o[i];
            }
        } catch (e) {
        }
    }
    thChoice.prototype.new = function(message=''||{}, options=[], callback=function(c,a) { a.next=true; return true; }, args={}, type=1) {
        try {
            if (typeof(message) === 'object') {
                this.fromObject(message);
            } else {
                this.message = message, this.options = options;
                this.callback = callback, this.args = args, this.type = type;
            }
        } catch (e) {
        }
    }

    // Other helper methods
    function aClone(a, start=0, end=this.length-1) {
        var b = a.slice(0);
        try {
            b.splice(0, start);
            b.splice(end+1);
        } catch (e) {
        }
        return b;
    }
    function aSplice(a, start=0, count=this.length-1) {
        var b = a.slice(0);
        try {
            b.splice(start, count);
        } catch (e) {
        }
        return b;
    }

    // get input commands
    var commands = require('./commands');

    // listen for the "keypress" event
    // this is where the main processing happens
    exports.stdin.on('keypress', function (ch, key) {
        // ensure we have a key object and it has a name
        if (typeof(key) === 'undefined') key = { sequence: ch, name: ch }
        if (key && key.hasOwnProperty('name') === false) key['name'] = ch;

        if (thlib.settings.processing == true) {
            // fix name for CTRL+C, Home & End keys (may add ctrl+arrow keys here later)
            if (key && key.sequence) { key.name = key.sequence; }
            if (key && key.sequence && key.sequence == '\u0003') { key.name = 'c'; }
            if (key && key.sequence && key.sequence == '\u001b[1~') { key.name = 'home'; }
            if (key && key.sequence && key.sequence == '\u001b[4~') { key.name = 'end'; }

            // setup prompt toggle variable (used to determine if a prompt should be displayed after processing)
            var prompt = true;
            // if debug is enabled then output the key object details (neater with console hijacking)
            if (thlib.settings.debug === true) { console.log(key); }

            // call before process event handler
            if (haltAll === false) conproc = exports.events.before_proc(ch, key);

            // a few temp vars to hold info for processing (may be wiped unexpectedly, should not be used in your code)
            var ostra = [], newstr = '', ostr = '', conproc = true;

            //- check if choice command is running
            if (thlib.hasOwnProperty('temp') && haltAll === false) {
                if (commands.checkChoice(key)) return true;
            }
            //- end choice

            // run command processor provided false was not returned from before_proc event handler
            if (conproc !== false && (!conproc.enter && conproc.enter !== false) && key && (key.name === 'enter' || key.name === "\r" || key.name === "\n" || key.name === "\r\n")) {
                // process enter key
                thlib.input.cursor_pos = 0; // increment cursor position
                thlib.temp.input.string = ''; // clear the temporary input string (required by xconsole to know if we have pressed enter if console.log is called from a command method)
                if (thlib.settings.termHistory != 0 && thlib.input.history[thlib.input.history.length - 1] !== thlib.input.string) {
                    // store input history
                    thlib.input.history.push(thlib.input.string);
                }

                if (thlib.settings.termHistory > 0 && thlib.input.history.length > thlib.settings.termHistory) {
                    // remove first history entry if we are at the maximum allowed (FIFO)
                    thlib.input.history.splice(0, 1)
                }
                // set the history position to the index of the next entry so we do not overwrite the last command or one that is selected
                thlib.input.history_position = thlib.input.history.length;

                if (thlib.settings.debug === true) { console.log(thlib.input.string); } // output debug message
                if (thlib.log.level === 2 || thlib.log.level === 3) { exports.log.writeln(thlib.input.string); } // write input to log file if logging is enabled for input

                if (thlib.settings.appendEndChar === true) { thlib.input.string += thlib.settings.lineEndOut; } // append line end character from settings
                exports.stdout.write(thlib.settings.lineEndOut); // output line end character to terminal
                exports.cursorTo(0); // set cursor position to 0

                var cmd = thlib.input.string;
                //- Check aliases against input string
                try { //- make sure we don't crash
                    var match = exports.startsWithAlias(thlib.input.string);
                    if (match !== null) {
                        var r = exports.events.line(cmd);
                        if ((r !== true) && (typeof(r) !== 'object' || r.hasOwnProperty('valid') === false || r.valid === false)) {
                            for (key in thlib.alias) {
                                if (thlib.alias[key] !== null && match === thlib.alias[key]) {
                                    prompt = true;
                                    var $1 = thlib.input.string.substr(thlib.alias[key].length);
                                    if ((key === 'run' && thlib.settings.allowRun === false) || typeof (commands[key]) !== 'function') {
                                        exports.writeln(locale.cmd.InvalidCommand + ' [' + match + ']');
                                    } else {
                                        if (key === 'run') prompt = false;
                                        commands[key]();
                                    }
                                }
                            }
                        }
                        if ((thlib.input.string === thlib.settings.lineEndIn || thlib.input.string === "" || thlib.input.string === thlib.settings.lineEndOut) && thlib.settings.proc_blank_line === true) {
                            // don't do anything if the user presses enter without any command (if prompt is set on display a new prompt)
                        //} else {
                        }
                    } else {
                        // fire line event handler
                        if (thlib.settings.appendEndChar === false) {
                          cmd = exports.stripLineEnd(cmd);
                        }
                        var r = exports.events.line(cmd);
      	                if ((typeof(r) === 'boolean' && r === false) || (typeof(r) === 'object' && typeof(r.valid) === 'boolean' && (r.valid === false || r.valid === 'false'))) {
                            cmd = exports.stripLineEnd(cmd);
                            if (cmd !== '' && thlib.settings.proc_blank_line === true) {
                                if (cmd.indexOf(' ') > -1) cmd = cmd.substr(0, cmd.indexOf(' '));
                                exports.writeln(locale.cmd.InvalidCommand + ' [' + cmd + ']');
                            }
      	                }
      	                if (typeof(r) === 'object' && typeof(r.prompt) === 'boolean' && r.prompt === false) {
      	                   prompt = false;
      	                } else {
                          prompt = true;
                        }
                    }
                } catch (e) {
                  //- something odd happened
                    console.log(e);
                }

                thlib.input.string = ''; // reset input string
                if (prompt !== false && thlib.settings.prompt !== null && thlib.settings.prompt !== '') {
                    exports.prompt();
                } else {
                    exports.cursorTo(0);
                } // set cursor position to 0
            } else if (conproc !== false && (!conproc.up && conproc.up !== false) && key && (key.name === 'up' || key.name === '\u001b[A') && thlib.input.history_position > -1) {
                // scroll back through command history
                if (thlib.settings.termHistory !== 0) {
                    exports.stdout.clearLine();  // clear current text
                    thlib.input.cursor_pos = 0;
                    exports.stdout.cursorTo(0);
                    if (thlib.input.history_position > 0) { thlib.input.history_position -= 1; }
                    if (thlib.settings.prompt !== null && thlib.settings.prompt !== '') { exports.prompt(); }
                    if (thlib.input.history_position < thlib.input.history.length && thlib.input.history_position > -1) {
                        thlib.input.string = thlib.input.history[thlib.input.history_position].substr(0, thlib.input.history[thlib.input.history_position].length);
                        exports.stdout.write(thlib.input.string);
                        thlib.input.cursor_pos += thlib.input.string.length;
                        exports.stdout.cursorTo(thlib.input.cursor_pos);
                    }
                    thlib.temp.input.string = thlib.input.string;
                }
            } else if (conproc !== false && (!conproc.down && conproc.down !== false) && key && (key.name === 'down' || key.name === '\u001b[B') && thlib.input.history_position < thlib.input.history.length) {
                // scroll forward through command history
                if (thlib.settings.termHistory !== 0) {
                    exports.stdout.clearLine();  // clear current text
                    exports.stdout.cursorTo(0);
                    thlib.input.cursor_pos = 0;
                    thlib.input.history_position += 1;
                    if (thlib.settings.prompt !== null && thlib.settings.prompt !== '') { exports.prompt(); }
                    if (thlib.input.history_position <= thlib.input.history.length - 1) {
                        thlib.input.string = thlib.input.history[thlib.input.history_position].substr(0, thlib.input.history[thlib.input.history_position].length);
                        exports.stdout.write(thlib.input.string);
                    } else {
                        thlib.input.string = '';
                    }
                    thlib.temp.input.string = thlib.input.string;
                    thlib.input.cursor_pos += thlib.input.string.length;
                    exports.stdout.cursorTo(thlib.input.cursor_pos);
                }
            } else if ((conproc !== false && !conproc.left && conproc.left !== false) && key && (key.name === 'left' || key.name === '\u001b[D') && key.ctrl === false) {
                // move back through line input, stop at end of prompt
                //console.log('boo');
                var plen = 0;
                var p = exports.getPrompt();
                if (p !== null) plen = p.length;
                if (!thlib.input.cursor_pos) thlib.input.cursor_pos = thlib.input.string.length + plen;
                //console.log(thlib.input.cursor_pos.toString() + ',' + plen.toString());
                if (thlib.input.cursor_pos > plen)
                    module.exports.cursorTo(thlib.input.cursor_pos - 1);
            } else if (conproc !== false && (!conproc.right && conproc.right !== false) && key && (key.name === 'right' || key.name === '\u001b[C') && key.ctrl === false) {
                // move forward through line input, stop at end of line
                var plen = 0;
                var p = exports.getPrompt();
                if (p !== null) plen = p.length;
                if (!thlib.input.cursor_pos) thlib.input.cursor_pos = plen;
                //console.log(thlib.input.cursor_pos.toString() + ',' + (thlib.input.string.length + plen).toString());
                if (thlib.input.cursor_pos < (thlib.input.string.length + plen))
                exports.cursorTo(thlib.input.cursor_pos + 1);
            } else if ((conproc !== false && !conproc.left && conproc.left !== false) && key && (key.name === 'left' || key.name === '\u001b[1;5D') && key.ctrl === true) {
                // jump back through line input, stop at end of prompt
                var plen = 0;
                var p = exports.getPrompt();
                if (p !== null) plen = p.length;
                if (!thlib.input.cursor_pos) thlib.input.cursor_pos = thlib.input.string.length + plen;
                var l = thlib.input.string.lastIndexOf(' ', (thlib.input.cursor_pos - plen - 2)) + plen;
                if (l > plen) exports.cursorTo(l + 1);
                else exports.cursorTo(plen);
            } else if ((conproc !== false && !conproc.right && conproc.right !== false) && key && (key.name === 'right' || key.name === '\u001b[1;5C') && key.ctrl === true) {
                // jump forward through line input, stop at end of prompt
                var plen = 0;
                var p = exports.getPrompt();
                if (p !== null) plen = p.length;
                if (!thlib.input.cursor_pos) thlib.input.cursor_pos = plen;
                var cp = (thlib.input.cursor_pos - plen)
                var l = thlib.input.string.indexOf(' ', cp - 2) + plen;
                //console.log({ l:l, slen:(plen + thlib.input.string.length), pos:cp });
                if (cp + l < plen + thlib.input.string.length) exports.cursorTo(cp + l + 1);
                else exports.cursorTo((plen + thlib.input.string.length));
            } else if (conproc !== false && (!conproc.backspace && conproc.backspace !== false) && key && (key.name === 'backspace' || key.name === '' || key.name === '\b')) {
                // delete the character behind the cursor from line input
                var plen = 0;
                var p = exports.getPrompt();
                if (p !== null) plen = p.length;
                if (!thlib.input.cursor_pos) thlib.input.cursor_pos = thlib.input.string.length + plen;
                if (thlib.input.cursor_pos > plen) {
                    exports.stdout.clearLine();  // clear current text
                    exports.stdout.cursorTo(0);
                if (thlib.settings.prompt !== null && thlib.settings.prompt !== '') {
                    exports.prompt();
                }
                thlib.input.cursor_pos -= plen;
                ostra = thlib.input.string.split('');
                ostra.splice((thlib.input.cursor_pos - plen) - 1, 1);
                newstr = ostra.join('');
                thlib.input.string = newstr;
                thlib.temp.input.string = thlib.input.string;
                thlib.input.cursor_pos -= 1;
                if (thlib.settings.echoKeys === true) { exports.stdout.write(thlib.input.string); }
                    exports.stdout.cursorTo(thlib.input.cursor_pos);
                }
            } else if (conproc !== false && (!conproc.delete && conproc.delete !== false) && key && (key.name === 'delete' || key.name === '\u001b[3~')) {
                // delete the character infront of cursor from line input
                var plen = 0;
                var p = exports.getPrompt();
                if (thlib.settings.prompt !== null) plen = p.length;
                if (!thlib.input.cursor_pos) thlib.input.cursor_pos = thlib.input.string.length + plen;
                if (thlib.input.cursor_pos > plen - 1) {
                    try {
                        exports.stdout.clearLine();  // clear current text
                        exports.stdout.cursorTo(0);
                    } catch (e) {
                    }
                    if (thlib.settings.prompt !== null && thlib.settings.prompt !== '') {
                        thlib.input.cursor_pos -= plen;
                        exports.prompt();
                    }
                    ostra = thlib.input.string.split('');
                    ostra.splice((thlib.input.cursor_pos - plen), 1);
                    newstr = ostra.join('');
                    thlib.input.string = newstr;
                    thlib.temp.input.string = thlib.input.string;
                    if (thlib.settings.echoKeys === true) { exports.stdout.write(thlib.input.string); }
                    exports.stdout.cursorTo(thlib.input.cursor_pos);
                }
            } else if (conproc !== false && (!conproc.end && conproc.end !== false) && (key && key.name === 'end' || key.name === "\u001bOF" || key.name === "\u001b[4~]")) {
                var plen = 0;
                if (thlib.settings.prompt !== null && thlib.settings.prompt !== '') plen = exports.getPrompt().length;
                exports.cursorTo(thlib.input.string.length + plen);
            } else if (conproc !== false && (!conproc.home && conproc.home !== false) && (key && key.name === 'home' || key.name === "\u001bOH" || key.name === "\u001b[1~]")) {
                var plen = 0;
                if (thlib.settings.prompt !== null && thlib.settings.prompt !== '')  plen = exports.getPrompt().length;
                exports.cursorTo(plen);
            } else if (conproc !== false && (!conproc.kill && conproc.kill !== false) && (key && key.ctrl === true && (key.name === 'c' || key.name === '\u0003')) && thlib.settings.allowKill === true) {
                // kill application (CTRL+C)
                exports.clearLine();
                exports.cursorTo(0);
                exports.writeln(locale.app.kill);
                if (thlib.log.level === 2 || thlib.log.level === 3) {
                    exports.log.writeln(locale.log.AppKill, function () { process.exit(); });
                } else {
                    process.exit();
                }
            } else if (conproc !== false && ch) {
                // append character to input string
                ostr = thlib.input.string;
                var p = exports.getPrompt();
                var plen = 0;
                if (!p || p === null) p = '';
                if (!thlib.temp.prompt) thlib.temp.prompt = '';
                if (p === '' && thlib.input.cursor_pos === thlib.input.string.length + thlib.temp.prompt.length) module.exports.cursorTo();
                if (p !== null) { plen = p.length; }
                if (thlib.settings.echoKeys) {
                    if (thlib.input.cursor_pos < (thlib.temp.prompt.length + thlib.input.string.length)) {
                        thlib.input.string = [
                            ostr.slice(0, thlib.input.cursor_pos - thlib.temp.prompt.length), ch, ostr.slice(thlib.input.cursor_pos - thlib.temp.prompt.length)
                        ].join('');
                    } else {
                        thlib.input.string += ch;
                    }
                    thlib.input.cursor_pos++;
                    if (!thlib.input.cursor_pos) thlib.input.cursor_pos = thlib.input.string.length + plen;
                    var oc = thlib.input.cursor_pos - thlib.temp.prompt.length;
                    try {
                        exports.stdout.clearLine();  // clear current text
                        exports.stdout.cursorTo(0);
                    } catch (e) {}
                    if (thlib.settings.prompt !== null) {
                        oc += plen;
                        exports.prompt();
                    }
                    thlib.temp.prompt = p;
                    //console.log({ input: thlib.input.string, oc: oc });
                    exports.stdout.write(thlib.input.string);
                    thlib.input.cursor_pos = oc; // put the cursor back where it was
                    exports.stdout.cursorTo(oc);
                    thlib.temp.input.string = thlib.input.string;
                }
            }

            // process keypress events
            if (haltAll === false) conproc = exports.events.keypress(ch, key);
        }
    });

    // this command allows processing of keystrokes
    try {
      exports.stdin.setRawMode(true);
    } catch (e) { }
    // Resume STDIN allows terminal input (puts stream in old mode)
    if (thlib.settings.use_old_stdin_stream === true) exports.stdin.resume();
}());
