
/*
    Termhelper terminal commands
    Author: Elijah Cowley

    Declare terminal commands in this file and declare a matching alias in your config
    to allow users to run commands.
    Note: these methods are mostly wrappers for the internal functions so they can be exposed to the terminal prompt.
    TODO: possibly add bin or modules directory to get methods from individual "executable" files
*/

module.exports = {
    run: function () {
        // execute command in terminal
        var cmd = thlib.input.string.substr(thlib.alias.run.length);
        if (cmd.substr(0, 1) === ' ') { cmd = cmd.substr(1); }
        cmd = cmd.replace(thlib.settings.lineEndIn, '');
        if (thlib.settings.appendEndChar === true) { cmd += thlib.settings.lineEndOut; }
        term.run(cmd);
    },
    echo: function () {
        // echo runs javascript eval on string and outputs result to terminal
        var cmd = thlib.input.string.substr(thlib.alias.echo.length + 1);
        cmd = term.stripLineEnd(cmd);
        if (cmd.substr(0, 1) === ' ') { cmd = cmd.substr(1); }
        term.echo(cmd);
    },
    prompt: function () {
        // change terminal prompt
        var cmd = thlib.input.string.substr(thlib.alias.prompt.length + 1);
        if (cmd === null) cmd = '';
        cmd = term.stripLineEnd(cmd);
        if (cmd.substr(0, 1) === ' ') { cmd = cmd.substr(1); }
        term.set('settings', 'prompt', cmd);
    },
    show: function () {
        // show settings alias
        var cmd = thlib.input.string;
        cmd = term.stripLineEnd(cmd);
        if (cmd.length > thlib.alias.show.length) {
            cmd = cmd.substr(thlib.alias.show.length + 1);
        } else {
            cmd = cmd.substr(thlib.alias.show.length);
        }
        if (cmd === "") {
            term.writeln(term.show(""));
        } else {
            term.writeln(term.show(cmd));
        }
    },
    exit: function () {
        // exit application
        term.writeln(locale.app.exit);
        if (thlib.log.level === 2 || thlib.log.level === 3) {
            term.log.writeln(locale.log.AppExit, process.exit);
        }
    },
    version: function () {
        // output termhelper version (see example to override this and display your own app version)
        term.writeln(term.version());
    },
    time: function () {
        // display the time
        var d = new Date();
        term.writeln(d.toLocaleTimeString());
    },
    date: function () {
        // display the date
        var d = new Date();
        term.writeln(term.formatDate(thlib.settings.date_format, thlib.settings.date_splitter));
    },
    clear: function () {
        // clear the terminal
        try {
            //term.stdout.clear();
            //term.stdout.write('\033c');
            term.stdout.write('\x1b[2J\x1b[1;1H');
        } catch (ex) {
            if (thlib.hasOwnProperty('DEVELOPER')) {
                throw new Error('Unable to clear screen, ' + ex);
            }
        }
    },
    uptime: function () {
        // show how long the application has been running
        term.write(locale.cmd.Uptime);
        var cmd = thlib.input.string;
        if (thlib.settings.appendEndChar === false) {
            cmd = term.stripLineEnd(cmd);
        }
        var d = term.counterFormat(term.uptime());
        //var d = term.uptime();
        //if (!d || d === '') d = term.uptime();
        term.writeln(d);
    },
    unixTime: function () {
        // display the amount of seconds since the unix epoc 1/1/1970
        var cmd = thlib.input.string;
        if (thlib.settings.appendEndChar === false) {
            cmd = term.stripLineEnd(cmd);
        }
        var d = new Date();
        if (cmd.indexOf(' ') === -1) {
            d = new Date(cmd.replace(thlib.alias.unixTime + ' ', ''));
        }
        term.writeln(d.getUnixTime());
    },
    console: function () {
        // display which console object is being used
        term.writeln(term.console);
    },
    checkChoice: function (key) {
        // this method cannot be called from the terminal by a user but is checked during each line processing loop to see if choice is running
        // not fully tested and implemented yet, may be better to use "exec choice" or "exec read" depending on OS.
        if (global['thlib'].temp.hasOwnProperty('choice')) {
            var index = -1;
            var enter = false;
            if (thlib.temp.choice.type !== 1) {
                index = thlib.temp.choice.options.indexOf(key.name)
            } else if (thlib.temp.choice.type === 1 && (key.name === 'enter' || key.name === "\r" || key.name === "\n" || key.name === "\r\n")) {
                index = thlib.temp.choice.options.indexOf(thlib.input.string);
                enter = true;
            }
            if (enter === false) term.write(key.name);
            if (index !== -1) {
                //if (enter === true) term.write(key.name);
                if (thlib.temp.choice.hasOwnProperty('timer') === true) {
                    try {
                        clearTimeout(thlib.temp.choice.timer);
                    } catch (e) { }
                }
                thlib.settings.prompt = thlib.temp.choice.prompt;
                term.writeln('');
                term.clearLine();
                term.cursorTo(0);
                var c = thlib.temp.choice.callback(thlib.temp.choice.options[index], thlib.temp.choice.args);
                delete (thlib.temp.choice);
                //term.writeln('');
                term.clearLine();
                term.cursorTo(0);
                if (c === true) {
                    term.prompt();
                }
                return c;
            }
            if (key.name === 'backspace' || key.name === '' || key.name === '\b' || key.name === 'delete' || key.name === '\u001b[3~') {
                term.clearLine();
                term.cursorTo(0);
                term.prompt();
                return false;
            } else if (key.ctrl !== true || (key.name !== 'c' || key.name !== '\u0003')) {
                return true;
            }
        }
        return false;
    }
}