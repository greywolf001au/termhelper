var keypress = require('keypress')
  , thlib = require('./termhelper.lib.js')
//  , colors = require('colors')


keypress(process.stdin);

module.exports = {
  events: {
    before_proc: function(ch, key) {},
    keypress: function(ch, key) {},
    line: function(data) {}
  },

  on: function(event, callback) {
    this.events[event] = callback;
  },
  set: function(key, val) {
    if (!val && key == 'prompt') val = '';
    if (val) {
      thlib.Settings[key] = val;
    } else {
      for (var x in key) {
        thlib.Settings[x] = key[x];
      }
    }
  },
  Prompt: function() {
    thlib.Prompt();
  },
  CursorTo: function(pos) {
    thlib.input.cursor_pos = pos;
    process.stdout.cursorTo(pos);
  },
  CursorPos: function() {
    return thlib.input.cursor_pos;
  },
  Clear: function() {
    process.stdout.write('\u001B[2J\u001B[0;0f');
    thlib.Prompt();
  },
  ClearLine: function() {
    process.stdout.clearLine();  // clear current text
    thlib.input.cursor_pos = 0;
  },
  Write: function(text) {
    thlib.input.string = thlib.input.string + text
    this.CursorTo(0);
    this.Prompt();
    thlib.input.cursor_pos += text.length;
    process.stdout.write(thlib.input.string);
  },
  Writeln: function(text) {
    process.stdout.write(text + thlib.Settings.lineEnd);
    thlib.input.cursor_pos = 0;
  }
}
var exports = module.exports;

// listen for the "keypress" event
process.stdin.on('keypress', function (ch, key) {
  if (thlib.Settings.debug == true) console.log(key);

  var conproc = exports.events.before_proc(ch, key);
  if (conproc != false && key && key.name == 'enter') {
    thlib.input.string += ch;
    thlib.input.cursor_pos += 1;
    if (thlib.input.string.substr(thlib.input.string.length-1,1) == '\r') thlib.input.string = thlib.input.string.substr(0,thlib.input.string.length-1);
    if (thlib.Settings.debug == true) console.log(thlib.input.string);
    if (thlib.Settings.appendEndChar == true) thlib.input.string += thlib.Settings.lineEnd;
    process.stdout.write(thlib.Settings.lineEnd);
    thlib.input.cursor_pos = 0;
    exports.events.line(thlib.input.string)
    if (thlib.Settings.termHistory == true) {
      thlib.input.history.push(thlib.input.string);
      thlib.input.history_position = thlib.input.history.length - 1;
    }
    thlib.input.string = '';
  } else if (conproc != false && key && key.name == 'up' && thlib.input.history_position > -1) {
    if (thlib.Settings.termHistory == true) {
      process.stdout.clearLine();  // clear current text
      thlib.input.cursor_pos = 0;
      process.stdout.cursorTo(0);
      exports.Prompt();
      if (thlib.input.history_position < thlib.input.history.length && thlib.input.history_position > -1) {
        process.stdout.write(thlib.input.history[thlib.input.history_position].substr(0,thlib.input.history[thlib.input.history_position].length - 1));
        thlib.input.string = thlib.input.history[thlib.input.history_position].substr(0,thlib.input.history[thlib.input.history_position].length - 1);
        thlib.input.cursor_pos += thlib.input.string.length;
      }
      if (thlib.input.history_position > 0) thlib.input.history_position -= 1;
   }
  } else if (conproc != false && key && key.name == 'down' && thlib.input.history_position < thlib.input.history.length) {
    if (thlib.Settings.termHistory == true) {
      process.stdout.clearLine();  // clear current text
      process.stdout.cursorTo(0);
      thlib.input.cursor_pos = 0;
      exports.Prompt();
      if (thlib.input.history_position < thlib.input.history.length-1) {
        thlib.input.history_position += 1;
        process.stdout.write(thlib.input.history[thlib.input.history_position].substr(0,thlib.input.history[thlib.input.history_position].length - 1));
        thlib.input.string = thlib.input.history[thlib.input.history_position].substr(0,thlib.input.history[thlib.input.history_position].length - 1);
      } else {
        thlib.input.string = '';
      }
      thlib.input.cursor_pos += thlib.input.string.length;
    }
  } else if (conproc != false && key && key.name == 'left') {
    if (thlib.input.cursor_pos > thlib.Settings.prompt.length) thlib.input.cursor_pos -= 1;
    process.stdout.cursorTo(thlib.input.cursor_pos);
  } else if (conproc != false && key && key.name == 'right') {
    if (thlib.input.cursor_pos < (thlib.input.string.length + thlib.Settings.prompt.length)) thlib.input.cursor_pos += 1;
    process.stdout.cursorTo(thlib.input.cursor_pos);
  } else if (conproc != false && key && key.name == 'backspace') {
    if (thlib.input.cursor_pos > thlib.Settings.prompt.length + 1) {
      process.stdout.clearLine();  // clear current text
      process.stdout.cursorTo(0);
      thlib.input.cursor_pos -= thlib.Settings.prompt.length;
      exports.Prompt();
      var ostra = thlib.input.string.split('');
      ostra.splice((thlib.input.cursor_pos-thlib.Settings.prompt.length)-1,1)
      var newstr = ostra.join('')
      thlib.input.string = newstr;
      thlib.input.cursor_pos -= 1;
      if (thlib.Settings.echoKeys == true)
        process.stdout.write(thlib.input.string);    
      process.stdout.cursorTo(thlib.input.cursor_pos);
    }
  } else if (conproc != false && key && key.ctrl == true && key.name == 'c' && thlib.Settings.allowKill == true) {
    process.exit();
  } else if (conproc != false && ch) {
    //thlib.input.string += ch;
    var ostr = thlib.input.string;
    if (thlib.input.cursor_pos < (thlib.Settings.prompt.length + thlib.input.string.length)) {
      thlib.input.string = [
        ostr.slice(0, thlib.input.cursor_pos - thlib.Settings.prompt.length)
        , ch
        , ostr.slice(thlib.input.cursor_pos - thlib.Settings.prompt.length)
      ].join('');
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
  conproc = exports.events.keypress(ch, key);
});

process.stdin.setRawMode(true);

// Resume STDIN
process.stdin.resume();

