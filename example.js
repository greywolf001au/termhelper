var term = require('./termhelper.js') //note: this example uses ./termhelper.js as it does not have itself as a module, to use as a module simply use 'termhelper'

// add your details to the empty app object, may contain variables you want evaluating
term.app = {
    name: 'termhelper#node.js',
    //version: '0.0.1'      //- use this in conjunction with the on('line') processing below to display your app version when the user types the version command
}

// change termhelper settings
/*
term.set(null, {
	debug: false,
	prompt: "this.app.name + '> '",
	appendEndChar: false,
	termHistory: 3,
	locale: 'default',
});
*/

// settings used for testing on windows10
term.set(null, {
	debug: false, // toggle this to display key information when each key is pressed
	prompt: "this.app.name + '> '", // set prompt to the name variable set in the app object
	lineEndIn: "\r", // turn on debug and press enter to see what character is used
	lineEndOut: "\r\n", // force output to use carriage return and line feed for linux file compatibility
	appendEndChar: false, // append end character sequence to all lines (should not need this unless echo keys is turned off)
    echoKeys: true, // echo the users key strokes
    use_xconsole: true // hijack the console for cleaner console.log calls
});

// change the alias for the exit command to close (typing exit will no longer work)
term.set('alias', 'exit', 'close');
// set the run alias to null preventing the command from being run
term.set('alias', 'run', null);

// change locale setting
//term.set(null, 'locale', 'leet');  //- note this locale file does not exist and will fail, this is example is here for adding your own locale file

// prompt the user to make a choice, make an automatic selection of option 0 if the user does not choose in 5 seconds
// choice is processed on enter key (only basic testing has been performed)
/*
term.choice({
    message: 'Show prompt?',
    options: ['y','n'],
    timeout: 5000,
    default: 0,
    append: ' ',
    type: term.LINE,
    callback: function (c, a) { (c === 'y') ? term.prompt() : term.set(null,'prompt',''); return true; },
    args: {},
    HIDEOPTS: false
})
*/

// output the prompt on application start, comment this if you uncomment choice above or you will see 2 copies of the choice prompt.
term.prompt();


/*/
*** The following examples show how to process line commands, key presses and add your own processing prior to termhelper
*** seeing the input. This allows for full manipulation of command entry for such things as hiding passwords during entry,
*** overriding the default behaviour of a key or processing your own commands using the same names with fall through (ie. version).
/*/

// declare events for line input
/*
term.on('line', function (data) {
	// check if the user typed 'hello' and output 'world'
	if (data === 'hello') {
		term.writeln('world');
		return true; // used to tell the code that a valid command was typed
  	}
    // typing test1 will output all our settings (not useful in production)
    if (data === 'test1') {
		term.echo(term.lib.settings);
		return { valid: true, prompt: true }; // return an object containing the true for valid code and telling the in-built command not to display a prompt (avoid double up prompts)
   	}
    // typing test2 will output any variables stored in app
    if (data === 'test2') {
		term.echo(term.app);
		return { valid: true, prompt: true }; // same as previous return statement
    }
    // Override the version command (uncomment app.version at the top of this file to display your own version information)
    if (data === 'version') {
        try {
            var v = term.app.version;
            if (typeof(v) === 'string') {
                term.writeln('Version: ' + v);
                return true;
            }
        } catch (ex) { } // no need to display any error info just fall through to the default version command
        return false;
 	}
  	return { valid: false, prompt: true }; // no valid command found - carry on processing
});
*/

// declare keypress event handlers, the before_proc event will occur prior to any processing (the keypress event will be called after default processing occurs)
/*
term.on('before_proc', function (ch, key) {
	// the 'T' key was pressed, output the letters 'tes'. this occurs prior to processing the letter 't' so it will be appended to the input
  	if (key && key.name && key.name === 't') {
    	term.write('tes');
	    return { left: false, right: false }; // same as next return statement
	}
	return { left: false, right: false }; // return an object that disables processing of the left and right arrow keys
});
*/

// declare keypress event handlers, the before_proc event will occur prior to any processing (the keypress event will be called after default processing occurs)
/*
term.on('keypress', function (ch, key) {
	// the 'R' key was pressed, output the letters 'un', as this occurs after default processing the letter 'R' will be placed before 'un'
  	if (key && key.name && key.name === 'r') {
    	term.write('un');
	    return true; // same as next return statement
	}
	return false; // not used as default processing occurs prior to keypress event
});
*/