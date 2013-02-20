var term = require('./termhelper.js') //note: this example uses termhelper.js as it does not have itself as a module, to use as a module simply use 'termhelper'

process.stdin.setEncoding('utf8');

term.set({
  debug: false,
  prompt: 'node.js> ',
  appendEndChar: false
});

term.Prompt();

term.on('line', function(data) {
  if (data == 'hello') term.Writeln('world');
  term.Prompt();
});

term.on('keypress', function(ch, key) {
  if (key.name == 's') {
    term.Write('mile');
//  term.Prompt();
    return false;
  }
});