/*

	Terminal Helper by EPCIT
	Author: Elijah cowley
	Version: 0.2.9
	Release: Beta
	Website: http://epcit.biz
	GitHub: https://github.com/greywolf001au/termhelper.git

*/

(function () {
  "use strict";

  var keypress = require('keypress'), thlib = require('./termhelper.conf.js'), util = require('util'), fs = require('fs'), exec = require('child_process').exec, app = {}, child, locale = require(thlib.settings.locale_path + '/' + thlib.settings.locale + '.lib.js'), readline = require('readline');
  keypress(process.stdin);

    // Add the unixTime method to the Date object
    Date.prototype.getUnixTime = function () { return this.getTime() / 1000 | 0 };
    Date.prototype.setUnixTime = function (timestamp) { this.setTime(Math.floor(parseInt(timestamp) * 1000)); return this; };
    Date.now = function () { return new Date(); }
    Date.prototype.time = function () { return Date.now().getUnixTime(); }

  module.exports = {
    KEY: 0,
    LINE: 1,
    STARTED: new Date().getUnixTime(),
    argc: process.argv[0],
    argv: aSplice(process.argv, 0, 1),
    module: {
      name: "termhelper",
      version: "0.2.9",
      author: "Elijah Cowley",
      website: "http://epcit.biz",
    },
    lib: thlib,
    events: {
        // default event declarations
        before_proc: function (ch, key) { return { ch: ch, key: key }; },
        keypress: function (ch, key) { return { ch: ch, key: key }; },
        line: function (data) { return false; }
      },
    Choice: thChoice,
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
        if (val !== undefined) {
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
                  if (x === 'locale') { locale = require(thlib.settings.locale_path + './locale/' + thlib.settings.locale + '.lib.js'); }
                }
              }
            }
        }
    },
    getPrompt: function () {
        // create the prompt string
        var p = thlib.settings.prompt;
        var d = new Date();
        var path = __dirname;
        try {
          if (fs) {}
        } catch (ex) {}
        // replace terminal variable identifiers
        if (thlib.temp.hasOwnProperty('clock') === false && p.indexOf('%*') > -1) this.startClock();
        else if (thlib.temp.hasOwnProperty('clock') === false && p.indexOf('%*') === -1) this.stopClock();
        p = p.replace(/%d/g, this.formatDate(thlib.settings.date_format, thlib.settings.date_splitter)); //- Date (locale based)
        p = p.replace(/%p/g, __dirname); //- Path
        p = p.replace(/%t/g, d.toLocaleTimeString()); //- Time (locale based)
        p = p.replace(/%!/g, thlib.input.history_position); //- History Position (may remove from future releases)
        p = p.replace(/%@/g, thlib.input.history_position); //- History Position (because @ history position seems more appropriate)
        p = p.replace(/%#/g, thlib.input.history.length); //- History length
        p = p.replace(/%v/g, this.Version()); //- Termhelper version
        p = p.replace(/%\*/g, ''); //- Clock (this will start a timer to update the prompt)
        p = p.replace(/%uptime/g, this.counterFormat(this.uptime())).toString(); //- Display the length of time this module has been running (require termhelper early for most accurate app uptime)(process.uptime was problematic but will keep testing)
        p = p.replace(/%u/g, d.getUnixTime()); //- Unix time (seconds passed since 1/1/1970 10:00:00am)
        try {
          p = eval(p);
        } catch (ex) {
        }
        return p;
    },
    updatePrompt: function () {
      var inp = thlib.input.string; //.replace(thlib.temp.prompt, '');
      var p = this.getPrompt();
      var t = thlib.input.cursor_pos;
      //inp = inp.replace(thlib.temp.lastPrompt, '');
      exports.clearLine(); // <- use exports as this is run privately from the timer and this.clearLine etc are unrecognised
      exports.cursorTo(0);
      // display prompt in terminal
      if (p && p !== null && p !== '') {
        process.stdout.write(p);
      }
      thlib.input.string = inp;
      process.stdout.write(inp);
      thlib.input.cursor_pos = (t - thlib.temp.prompt.length) + p.length; // put the cursor back where it was not at the end of the input
      thlib.temp.lastPrompt = thlib.temp.prompt;
      thlib.temp.prompt = p;
      exports.cursorTo(thlib.input.cursor_pos);
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
      if (thlib.hasOwnProperty('temp') === false) thlib['temp'] = {};
      var int = 60000;
      if (thlib.settings.hasOwnProperty('clockUpdateInterval') === true) int = thlib.settings.clockUpdateInterval;
      thlib.temp['clock'] = setInterval(function() { exports.updatePrompt(); }, int);
    },
    stopClock: function() {
      if (thlib.hasOwnProperty('temp') === false) thlib['temp'] = {};
      if (thlib.temp.hasOwnProperty('clock') === true) {
        clearTimeout(thlib.temp['clock']);
        delete(thlib.temp.clock);
      }
    },
    Prompt: function () {
  	    // display prompt in terminal
  	    var p = this.getPrompt();
  	    if (p && p !== null && p !== '') {
          if (thlib.hasOwnProperty('temp') === false) thlib['temp'] = {};
          if (thlib.temp.hasOwnProperty('prompt') === false) thlib.temp['prompt'] = p;
          thlib.temp.lastPrompt = thlib.temp.prompt;
          thlib.temp.prompt = p;
  	      process.stdout.write(p.toString());
  	      thlib.input.cursor_pos += p.length;
  	    }
      },
    CursorTo: function (x, y=null) {
        // move the cursor to specified position
        thlib.input.cursor_pos = x;
        //process.stdout.cursorTo(pos);
        readline.cursorTo(process.stdout, x, y);
      },
    CursorPos: function () {
        // return the current cursor position
        return thlib.input.cursor_pos;
      },
    Clear: function (prompt) {
        // clear terminal screen
        process.stdout.write('\u001B[2J\u001B[0;0f');
        if (thlib.settings.debug === true) {
          this.writeln('Warning: This command has been deprecated, try using a lowercase letter at the beginning of the command instead.');
        }
        if ((prompt && (prompt === null || prompt === true)) && thlib.settings.prompt !== null && thlib.settings.prompt !== '') { module.exports.Prompt(); }
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
        if (thlib.log.level === 1 || thlib.log.level === 3) { exports.log.write(text); }
      },
    Writeln: function (text) {
        // write a string to the terminal, append line end character and output prompt
        if (typeof(text) === 'string' || typeof(text) === 'number') {
          module.exports.write(text + thlib.settings.lineEndOut);
        } else {
          try {
            // try to evaluate input text as JavaScript
            this.write(eval(text) + thlib.settings.lineEndOut);
          } catch (ex) {
            this.write(text + thlib.settings.lineEndOut);
          }
        }
        thlib.input.string = '';
        this.CursorTo(0);
        return false;
      },
    Echo: function (text) {
        // write a string to the terminal, append line end character and output prompt
        if (typeof(text) === 'string' || typeof(text) === 'number') {
          this.Write(text + thlib.settings.lineEndOut);
        } else {
          try {
            // Output object as text
            var out = '{' + thlib.settings.lineEndOut;
            var t = '';
            for (var x in text) {
              t = text[x];
              if (t === '\r') {
                t = '\\r';
              } else if (t === '\n') {
                t = '\\n';
              } else if (t === '\r\n') {
                t = '\\r\\n';
              } else if (t === '\n\r') {
                t = '\\n\\r';
              }
              out += '\t' + x + ': ' + t + thlib.settings.lineEndOut;
            }
            out += '}' + thlib.settings.lineEndOut;
            this.Write(out);
          } catch (ex) {
            this.Write(text + thlib.settings.lineEndOut);
          }
        }
        //thlib.input.cursor_pos = 0;
        thlib.input.string = '';
        this.CursorTo(0);
        return '';
      },
    Run: function (command, echo=true, callback = function(err, data) { return data; }) {
        // execute a terminal command
        if (command.substr(command.length - 1, 1) === thlib.settings.lineEnd) { command = command.substr(0, command.length - 1); }
        child = exec(command, // command line argument directly in string
        function (error, stdout, stderr) {      // one easy function to capture data/errors
          if (echo === true) process.stdout.write(stdout);
          if (thlib.log.level === 1 || thlib.log.level === 3) {
            exports.log.Write(stdout);
            if (stdout.substr(stdout.length - 2) !== '\r\n' && stdout.substr(stdout.length - 2) !== '\n\r' && stdout.substr(stdout.length - 1) !== '\n' && stdout.substr(stdout.length - 1) !== '\r') {
              exports.log.Write(thlib.settings.lineEndOut);
            }
          }
          if (echo === true && stderr !== null && stderr !== '') {
            process.stdout.write(stderr.split(':').splice(1, 2).join('').substr(1));
          }
          //if (echo === true && error !== null) {
            //process.stdout.write(error);
          //}
          //thlib.input.cursor_pos = 0;
          thlib.input.string = '';
          if (echo === true && thlib.settings.prompt !== null && thlib.settings.prompt !== '') { module.exports.Prompt(); }
		      return callback(stderr, stdout);
        });
      },
    Eval: function (data) {
        var res = '';
        try {
          res = eval(data);
        } catch (ex) {
          res = data;
        }
        this.Writeln(res);
        if (thlib.log.level === 1 || thlib.log.level === 3) { exports.log.Writeln(res); }
      },
    Version: function () {
        return this.module.version;
      },
    Show: function (key) {
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
    StripLineEnd: function (str) {
        if (str.substr(str.length - thlib.settings.lineEndIn.length, thlib.settings.lineEndIn.length) === thlib.settings.lineEndIn) str = str.substr(0, str.length - thlib.settings.lineEndIn.length);
        if (str.substr(str.length - thlib.settings.lineEndOut.length, thlib.settings.lineEndOut.length) === thlib.settings.lineEndOut) str = str.substr(0, str.length - thlib.settings.lineEndOut.length);
        return str;
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
  	    // display prompt in terminal
  	    var p = this.getPrompt();
  	    if (p && p !== null && p !== '') {
          if (thlib.hasOwnProperty('temp') === false) thlib['temp'] = {};
          if (thlib.temp.hasOwnProperty('prompt') === false) thlib.temp['prompt'] = p;
          thlib.temp.lastPrompt = thlib.temp.prompt;
          thlib.temp.prompt = p;
  	      process.stdout.write(p);
  	      thlib.input.cursor_pos += p.length;
  	    }
      },
    cursorTo: function (x, y=null) {
        // move the cursor to specified position
        thlib.input.cursor_pos = x;
        //process.stdout.cursorTo(pos);
        readline.cursorTo(process.stdout, x, y);
      },
    cursorPos: function () {
        // return the current cursor position
        return thlib.input.cursor_pos;
      },
    clear: function (prompt) {
        // clear terminal screen
        process.stdout.write('\u001B[2J\u001B[0;0f');
        if ((prompt && (prompt === null || prompt === true)) && thlib.settings.prompt !== null && thlib.settings.prompt !== '') { module.exports.Prompt(); }
      },
    clearLine: function () {
        // clear current line data
        process.stdout.clearLine();  // clear current text
        thlib.input.cursor_pos = 0;
        thlib.input.string = '';
      },
    write:  function (text) {
        // write a string to the terminal
        thlib.input.string = thlib.input.string + text.toString();
        thlib.input.cursor_pos += text.toString().length;
        process.stdout.write(text.toString());
        if (thlib.log.level === 1 || thlib.log.level === 3) { exports.log.write(text); }
      },
    writeln: function (text) {
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
        this.cursorTo(0);
        return false;
      },
    echo: function (text) {
        // write a string to the terminal, append line end character and output prompt
        if (typeof(text) === 'string' || typeof(text) === 'number') {
          this.Write(text + thlib.settings.lineEndOut);
        } else {
          try {
            // Output object as text
            var out = '{' + thlib.settings.lineEndOut;
            var t = '';
            for (var x in text) {
              t = text[x];
              if (t === '\r') {
                t = '\\r';
              } else if (t === '\n') {
                t = '\\n';
              } else if (t === '\r\n') {
                t = '\\r\\n';
              } else if (t === '\n\r') {
                t = '\\n\\r';
              }
              out += '\t' + x + ': ' + t + thlib.settings.lineEndOut;
            }
            out += '}' + thlib.settings.lineEndOut;
            this.Write(out);
          } catch (ex) {
            this.Write(text + thlib.settings.lineEndOut);
          }
        }
        //thlib.input.cursor_pos = 0;
        thlib.input.string = '';
        this.CursorTo(0);
        return '';
      },
    run: function (command, echo=true, callback = function(err, data) { return data; }) {
        // execute a terminal command
        if (command.substr(command.length - 1, 1) === thlib.settings.lineEnd) { command = command.substr(0, command.length - 1); }
        child = exec(command, // command line argument directly in string
        function (error, stdout, stderr) {      // one easy function to capture data/errors
          if (echo === true) process.stdout.write(stdout);
          if (thlib.log.level === 1 || thlib.log.level === 3) {
            exports.log.Write(stdout);
            if (stdout.substr(stdout.length - 2) !== '\r\n' && stdout.substr(stdout.length - 2) !== '\n\r' && stdout.substr(stdout.length - 1) !== '\n' && stdout.substr(stdout.length - 1) !== '\r') {
              exports.log.Write(thlib.settings.lineEndOut);
            }
          }
          if (echo === true && stderr !== null && stderr !== '') {
            process.stdout.write(stderr.split(':').splice(1, 2).join('').substr(1));
          }
          //if (echo === true && error !== null) {
            //process.stdout.write(error);
          //}
          //thlib.input.cursor_pos = 0;
          thlib.input.string = '';
          if (echo === true && thlib.settings.prompt !== null && thlib.settings.prompt !== '') { module.exports.Prompt(); }
		      return callback(stderr, stdout);
        });
      },
    eval: function (data) {
        var res = '';
        try {
          res = eval(data);
        } catch (ex) {
          res = data;
        }
        this.Writeln(res);
        if (thlib.log.level === 1 || thlib.log.level === 3) { exports.log.Writeln(res); }
      },
    version: function () {
      return this.module.version;
    },
    show: function (key) {
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
      if (str.substr(str.length - thlib.settings.lineEndIn.length, thlib.settings.lineEndIn.length) === thlib.settings.lineEndIn) str = str.substr(0, str.length - thlib.settings.lineEndIn.length);
      if (str.substr(str.length - thlib.settings.lineEndOut.length, thlib.settings.lineEndOut.length) === thlib.settings.lineEndOut) str = str.substr(0, str.length - thlib.settings.lineEndOut.length);
      return str;
    },
    choice: function (data={ message: '', options: [], timeout: 5000, default: 0, append: '', type: exports.LINE, callback: function(c,a) { a.next=true; return true; }, args: {}, HIDEOPTS: false }) {
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
      if (message === null) message = locale.app.exit;
      this.clearLine();
      exports.cursorTo(0);
      this.writeln(message);
      if (thlib.log.level === 2 || thlib.log.level === 3) { exports.log.writeln(locale.log.AppExit, function () { process.exit(exitCode); }); }
      else process.exit(exitCode);
    },
    uptime: function() {
      return (Date.time() - this.STARTED);
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
      Writeln: function (data, callback) {
          this.Write(data + thlib.settings.lineEndOut, callback);
        },
      write: function (data, callback) {
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
        this.Write(data + thlib.settings.lineEndOut, callback);
      },
    }
  };

  var exports = module.exports;

  // listen for the "keypress" event
  process.stdin.on('keypress', function (ch, key) {
  if (typeof(key) === 'undefined') {
      key = { sequence: ch, name: ch }
  }
  if (key && key.hasOwnProperty('name') === false) {
      key['name'] = ch;
      //console.log(key);
  }

  if (thlib.settings.processing == true) {
      if (key && key.sequence) { key.name = key.sequence; }
      if (key && key.sequence && key.sequence == '\u0003') { key.name = 'c'; }
      if (key && key.sequence && key.sequence == '\u001b[1~') { key.name = 'home'; }
      if (key && key.sequence && key.sequence == '\u001b[4~') { key.name = 'end'; }

      var prompt = true;
      if (thlib.settings.debug === true) { console.log(key); }

      //- choice
      if (thlib.hasOwnProperty('temp')) {
        if (thlib.temp.hasOwnProperty('choice')) {
          var index = -1;
          var enter = false;
          if (thlib.temp.choice.type !== 1) {
            index = thlib.temp.choice.options.indexOf(key.name)
          } else if (thlib.temp.choice.type === 1 && (key.name === 'enter' || key.name === "\r" || key.name === "\n" || key.name === "\r\n")) {
            index = thlib.temp.choice.options.indexOf(thlib.input.string);
            enter = true;
          }
          if (enter === false) exports.write(key.name);
          if (index !== -1) {
            //if (enter === true) exports.write(key.name);
            if (thlib.temp.choice.hasOwnProperty('timer') === true) {
              try {
                clearTimeout(thlib.temp.choice.timer);
              } catch (e) {}
            }
            thlib.settings.prompt = thlib.temp.choice.prompt;
            exports.writeln('');
            exports.clearLine();
            exports.cursorTo(0);
            var c = thlib.temp.choice.callback(thlib.temp.choice.options[index], thlib.temp.choice.args);
            delete(thlib.temp.choice);
            //exports.writeln('');
            exports.clearLine();
            exports.cursorTo(0);
            if (c === true) {
              exports.prompt();
            }
            return c;
          }
          if (key.name === 'backspace' || key.name === '' || key.name === '\b' || key.name === 'delete' || key.name === '\u001b[3~') {
            exports.clearLine();
            exports.cursorTo(0);
            exports.prompt();
          } else if (key.ctrl !== true || (key.name !== 'c' || key.name !== '\u0003')) {
           return true;
         }
       }
      }
      //- end choice

      // call before process event handler
      var conproc = exports.events.before_proc(ch, key),
          ostra = [], newstr = '', ostr = '';
      // run command processor providing false was not returned from before_proc event handler
      if (conproc !== false && (!conproc.enter && conproc.enter !== false) && key && (key.name === 'enter' || key.name === "\r" || key.name === "\n" || key.name === "\r\n")) {
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

        if (thlib.settings.appendEndChar === true) { thlib.input.string += thlib.settings.lineEndOut; } // append line end character from settings
        process.stdout.write(thlib.settings.lineEndOut); // output line end character to terminal
        exports.cursorTo(0); // set cursor position to 0

        //- Check aliases against input string
        try { //- make sure we don't crash if an alias does not exist
          if (thlib.settings.allowRun === true && thlib.input.string.substr(0, thlib.alias.run.length) === thlib.alias.run) {
            // execute command in terminal
            prompt = false;
            var cmd = thlib.input.string.substr(thlib.alias.run.length);
            if (cmd.substr(0, 1) === ' ') { cmd = cmd.substr(1); }
            if (thlib.settings.appendEndChar === true) { cmd = cmd.replace(thlib.settings.lineEndIn, ''); }
            exports.run(cmd);
          } else if (thlib.input.string.substr(0, thlib.alias.echo.length) === thlib.alias.echo) {
            // echo runs javascript eval on string and outputs result to terminal
            var cmd = thlib.input.string.substr(thlib.alias.echo.length + 1);
            cmd = exports.stripLineEnd(cmd);
            if (cmd.substr(0, 1) === ' ') { cmd = cmd.substr(1); }
            exports.echo(cmd);
          } else if (thlib.input.string.substr(0, thlib.alias.prompt.length) === thlib.alias.prompt) {
            // change terminal prompt
            var cmd = thlib.input.string.substr(thlib.alias.prompt.length + 1);
            cmd = exports.stripLineEnd(cmd);
            if (cmd.substr(0, 1) === ' ') { cmd = cmd.substr(1); }
            exports.set('settings', 'prompt', cmd);
          } else if (thlib.input.string != "" && thlib.input.string.substr(0, thlib.alias.show.length) === thlib.alias.show) {
  			    // show settings alias
            var cmd = thlib.input.string;
            cmd = exports.stripLineEnd(cmd);
            if (cmd.length > thlib.alias.show.length) {
              cmd = cmd.substr(thlib.alias.show.length + 1);
            } else {
              cmd = cmd.substr(thlib.alias.show.length);
            }
            if (cmd === "") {
              exports.writeln(exports.show(""));
            } else {
              exports.writeln(exports.show(cmd));
            }
          } else if (thlib.input.string.substr(0, thlib.alias.exit.length) === thlib.alias.exit) {
            // exit application
            prompt = false;
  		      exports.writeln(locale.app.exit);
            if (thlib.log.level === 2 || thlib.log.level === 3) { exports.log.Writeln(locale.log.AppExit, function () { process.exit(); }); }
          } else if (thlib.input.string.substr(0, thlib.alias.version.length) === thlib.alias.version) {
            exports.writeln(exports.version());
          } else if (thlib.input.string.substr(0, thlib.alias.time.length) === thlib.alias.time) {
            var d = new Date();
            exports.writeln(d.toLocaleTimeString());
          } else if (thlib.input.string.substr(0, thlib.alias.date.length) === thlib.alias.date) {
            var d = new Date();
            exports.writeln(exports.formatDate(thlib.settings.date_format, thlib.settings.date_splitter));
          } else if (thlib.input.string.substr(0, thlib.alias.clear.length) === thlib.alias.clear) {
            try {
  		          //process.stdout.Clear();
  		          //process.stdout.write('\033c');
                process.stdout.write('\x1b[2J\x1b[1;1H');
  		      } catch (ex) {
  			         if (thlib.hasOwnProperty('DEVELOPER')) {
                    throw new Error('Unable to clear screen, ' + ex);
                 }
  		      }
          } else if ((thlib.input.string === thlib.settings.lineEndIn || thlib.input.string === "" || thlib.input.string === thlib.settings.lineEndOut) && thlib.settings.proc_blank_line === true) {
            // don't do anything if the user presses enter without any command (if prompt is set on display a new prompt)
          } else if (thlib.input.string.substr(0, thlib.alias.uptime.length) === thlib.uptime) {
            var cmd = thlib.input.string;
            if (thlib.settings.appendEndChar === false) {
              cmd = exports.stripLineEnd(cmd);
            }
            var d = exports.counterFormat(exports.uptime());
            exports.writeln(d);
          } else if (thlib.input.string.substr(0, thlib.alias.unixTime.length) === thlib.unixTime) {
            var cmd = thlib.input.string;
            if (thlib.settings.appendEndChar === false) {
              cmd = exports.stripLineEnd(cmd);
            }
            var d = new Date();
            if (cmd.indexOf(' ') === -1) {
              d = new Date(cmd.replace(thlib.alias.unixTime + ' ', ''));
            }
            exports.writeln(d.getUnixTime());
          } else {
            // fire line event handler
            var cmd = thlib.input.string;
            if (thlib.settings.appendEndChar === false) {
              cmd = exports.stripLineEnd(cmd);
            }
            var r = exports.events.line(cmd);
            //console.log(r);        if (prompt !== false) { exports.Prompt(); } else { exports.CursorTo(0); } // set cursor position to 0

      	    if ((typeof(r) === 'boolean' && r === false) || (typeof(r) === 'object' && typeof(r.valid) === 'boolean' && (r.valid === false || r.valid === 'false'))) {
              //var cmd = thlib.input.string;
              cmd = exports.stripLineEnd(cmd);
              exports.writeln(locale.cmd.InvalidCommand + ' [' + cmd + ']');
      	    }
      	    if (typeof(r) === 'object' && typeof(r.prompt) === 'boolean' && r.prompt === false) {
      	       prompt = false;
      	    } else {
              prompt = true;
            }
          }
        } catch (e) {
          //- alias probably doesn't exist (this will probably digest all custom errors thrown which is fine for release)
        }
        thlib.input.string = ''; // reset input string
        if (prompt !== false && thlib.settings.prompt !== null && thlib.settings.prompt !== '') { exports.prompt(); } else { exports.cursorTo(0); } // set cursor position to 0
      } else if (conproc !== false && (!conproc.up && conproc.up !== false) && key && (key.name === 'up' || key.name === '\u001b[A') && thlib.input.history_position > -1) {
        // scroll back through command history
        if (thlib.settings.termHistory !== 0) {
          process.stdout.clearLine();  // clear current text
          thlib.input.cursor_pos = 0;
          process.stdout.cursorTo(0);
          if (thlib.input.history_position > 0) { thlib.input.history_position -= 1; }
          if (thlib.settings.prompt !== null && thlib.settings.prompt !== '') { exports.prompt(); }
          if (thlib.input.history_position < thlib.input.history.length && thlib.input.history_position > -1) {
            thlib.input.string = thlib.input.history[thlib.input.history_position].substr(0, thlib.input.history[thlib.input.history_position].length);
            process.stdout.write(thlib.input.string);
            thlib.input.cursor_pos += thlib.input.string.length;
            process.stdout.cursorTo(thlib.input.cursor_pos);
          }
        }
      } else if (conproc !== false && (!conproc.down && conproc.down !== false) && key && (key.name === 'down' || key.name === '\u001b[B') && thlib.input.history_position < thlib.input.history.length) {
        // scroll forward through command history
        if (thlib.settings.termHistory !== 0) {
          process.stdout.clearLine();  // clear current text
          process.stdout.cursorTo(0);
          thlib.input.cursor_pos = 0;
          thlib.input.history_position += 1;
          if (thlib.settings.prompt !== null && thlib.settings.prompt !== '') { exports.prompt(); }
          if (thlib.input.history_position <= thlib.input.history.length - 1) {
            thlib.input.string = thlib.input.history[thlib.input.history_position].substr(0, thlib.input.history[thlib.input.history_position].length);
            process.stdout.write(thlib.input.string);
          } else {
            thlib.input.string = '';
          }
          thlib.input.cursor_pos += thlib.input.string.length;
          process.stdout.cursorTo(thlib.input.cursor_pos);
        }
      } else if ((conproc !== false && !conproc.left && conproc.left !== false) && key && (key.name === 'left' || key.name === '\u001b[D')) {
        // move back through line input, stops at prompt
        var plen = 0;
        var p = exports.getPrompt();
        if (thlib.settings.prompt !== null && thlib.settings.prompt !== '') {
          plen = p.length;
        }
        if (thlib.input.cursor_pos > plen) { thlib.input.cursor_pos -= 1; }
        process.stdout.cursorTo(thlib.input.cursor_pos);
      } else if (conproc !== false && (!conproc.right && conproc.right !== false) && key && (key.name === 'right' || key.name === '\u001b[C')) {
        // move forward through line input, stop at end of line
        var plen = 0;
        var p = exports.getPrompt();
        if (thlib.settings.prompt !== null && thlib.settings.prompt !== '') {
          plen = p.length;
        }
        if (thlib.input.cursor_pos < (thlib.input.string.length + plen)) { thlib.input.cursor_pos += 1; }
        process.stdout.cursorTo(thlib.input.cursor_pos);
      } else if (conproc !== false && (!conproc.backspace && conproc.backspace !== false) && key && (key.name === 'backspace' || key.name === '' || key.name === '\b')) {
        // delete the character behind the cursor from line input
        var plen = 0;
        var p = exports.getPrompt();
        if (thlib.settings.prompt !== null && thlib.settings.prompt !== '') {
          plen = p.length;
        }
        if (thlib.input.cursor_pos > plen) {
          process.stdout.clearLine();  // clear current text
          process.stdout.cursorTo(0);
          if (thlib.settings.prompt !== null && thlib.settings.prompt !== '') {
            exports.prompt();
          }
          thlib.input.cursor_pos -= plen;
          ostra = thlib.input.string.split('');
          ostra.splice((thlib.input.cursor_pos - plen) - 1, 1);
          newstr = ostra.join('');
          thlib.input.string = newstr;
          thlib.input.cursor_pos -= 1;
          if (thlib.settings.echoKeys === true) { process.stdout.write(thlib.input.string); }
          process.stdout.cursorTo(thlib.input.cursor_pos);
        }
      } else if (conproc !== false && (!conproc.delete && conproc.delete !== false) && key && (key.name === 'delete' || key.name === '\u001b[3~')) {
        // delete the character infront of cursor from line input
        var plen = 0;
        var p = exports.getPrompt();
        if (thlib.settings.prompt !== null && thlib.settings.prompt !== '') {
          plen = p.length;
        }
        if (thlib.input.cursor_pos > plen - 1) {
          process.stdout.clearLine();  // clear current text
          process.stdout.cursorTo(0);
          if (thlib.settings.prompt !== null && thlib.settings.prompt !== '') {
            thlib.input.cursor_pos -= plen;
            exports.prompt();
          }
          ostra = thlib.input.string.split('');
          ostra.splice((thlib.input.cursor_pos - plen), 1);
          newstr = ostra.join('');
          thlib.input.string = newstr;
          if (thlib.settings.echoKeys === true) { process.stdout.write(thlib.input.string); }
          process.stdout.cursorTo(thlib.input.cursor_pos);
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
        if (p && p !== null && p !== '') { plen = p.length; }
        if (thlib.settings.echoKeys) {
          if (thlib.input.cursor_pos < (thlib.temp.prompt.length + thlib.input.string.length)) {
            thlib.input.string = [
              ostr.slice(0, thlib.input.cursor_pos - thlib.temp.prompt.length), ch, ostr.slice(thlib.input.cursor_pos - thlib.temp.prompt.length)
            ].join('');
          } else {
            thlib.input.string += ch;
          }
          var t = ++thlib.input.cursor_pos;
          process.stdout.clearLine();  // clear current text
          process.stdout.cursorTo(0);
          //thlib.input.cursor_pos -= plen;
          if (thlib.settings.prompt !== null && thlib.settings.prompt !== '') { exports.prompt(); }
          process.stdout.write(thlib.input.string);
          thlib.input.cursor_pos = (t - thlib.temp.lastPrompt.length) + plen; // put the cursor back where it was
          process.stdout.cursorTo(thlib.input.cursor_pos);
        }
      }

      // process keypress events
      conproc = exports.events.keypress(ch, key);
      }
    });

    // this command allows processing of keystrokes
    process.stdin.setRawMode(true);
    // Resume STDIN allows terminal input
    process.stdin.resume();
}());

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
