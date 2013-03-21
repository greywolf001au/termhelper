var term = require('./termhelper.js') //note: this example uses ./termhelper.js as it does not have itself as a module, to use as a module simply use 'termhelper'

term.set(null, {
	debug: false,
	prompt: 'node.js> ',
	appendEndChar: false,
	termHistory: 3
});

term.set('alias', 'exit', 'close');

term.Prompt();

term.on('line', function (data) {
	if (data === 'hello') {
		term.Writeln('world');
		return true;
  		/*term.Prompt();*/
  	} else if (data === 'test1') {
		term.Writeln(term.lib.settings);

  		//term.Prompt();
		return { valid: true, prompt: false };
  	}
  	return false;
});


term.on('before_proc', function (ch, key) {
  	if (key && key.name && key.name === 't') {
    	term.Write('tes');
	    return { left: false, right: false };
	}
	return { left: false, right: false };
});

