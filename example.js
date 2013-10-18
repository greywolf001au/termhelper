var term = require('./termhelper.js') //note: this example uses ./termhelper.js as it does not have itself as a module, to use as a module simply use 'termhelper'

// add your details to the empty app object, may contain variables you want evaluating
term.app = {
	name: 'termhelper#node.js'
}

// change termhelper settings
term.set(null, {
	debug: false,
	prompt: '',//"this.app.name + '> '",
	appendEndChar: false,
	termHistory: 3,
	locale: 'en-au',
});

// change alias for exit command to close
term.set('alias', 'exit', 'close');
//term.set(null, 'locale', 'leet');

// output the prompt on application start
term.Prompt();

/*
// declare events for line input
term.on('line', function (data) {
	// check if the user typed 'hello' and output 'world'
	if (data === 'hello') {
		term.Writeln('world');
		return true; // used to tell the code that a valid command was typed
  	} else if (data === 'test1') {
		term.Echo(term.lib.settings);
		return { valid: true, prompt: true }; // return an object containing the true for valid code and telling the in-built command not to display a prompt (avoid double up prompts)
   	} else if (data === 'test2') {
		term.Echo(term.app);
		return { valid: true, prompt: true }; // same as previous return statement
 	}
  	return { valid: false, prompt: true }; // no valid command found
});
*/
// declare keypress event handlers, the before_proc event will occur prior to any processing (the keypress event will be called after default processing occurs)

// Uncomment the line above and at the end to use these examples.
term.on('before_proc', function (ch, key) {
	// the 'T' key was pressed, output the letters 'tes', as this occurs prior to default processing the letter 'T' will be appended to the input
  	if (key && key.name && key.name === 't') {
    	term.Write('tes');
	    return { left: false, right: false }; // same as next return statement
	}
	return { left: false, right: false }; // return an object that disables processing of the left and right arrow keys
});

// declare keypress event handlers, the before_proc event will occur prior to any processing (the keypress event will be called after default processing occurs)
term.on('keypress', function (ch, key) {
	// the 'R' key was pressed, output the letters 'un', as this occurs after default processing the letter 'R' will be placed before 'un'
  	if (key && key.name && key.name === 'r') {
    	term.Write('un');
	    return true; // same as next return statement
	}
	return false; // not used as default processing occurs prior to keypress event
});

