var grunt = require("grunt");
var _ = require("lodash");
var readline = require("readline");
var charm = require("charm")(process.stdout);
var async = grunt.util.async;
var EventEmitter = require("events").EventEmitter;

var rlVent = new EventEmitter();

/**
 * Module exports
 */

var cli = module.exports;
var _cli = {};

/**
 * Helpers functions
 */

function normalizeChoices(choices) {
  return _.map(choices, function(val) {
    if (_.isString(val)) {
      return { name : val, value: val };
    }

    return {
      name: val.name || val.value,
      value: val.value || val.name
    };
  });
}

/**
 * Client interfaces
 */

_cli.rawlist = function(question, cb) {
  var selected = 0;
  var choices  = normalizeChoices(question.choices);

  function renderChoices() {
    choices.forEach(function(choice, i) {
      (i === selected) && charm.foreground("cyan");
      charm.write("  " + (i + 1) + ") " + choice.name + "\r\n").foreground("white");
    });
    charm.write("  Default (1) ");
  }

  function reRender() {
    _.each(_.range(choices.length + 1), function() {
      charm.up(1).erase("line");
    });
    renderChoices();
  }

  // Save user answer and update prompt to show selected option.
  rlVent.on("line", function(input) {
    if (input == null || input === "") {
      input = 1;
    }
    if (choices[input - 1] != null) {
      selected = input - 1;
      charm.erase("line");
      reRender();
      charm.write( input + "\r\n");
      rlVent.removeAllListeners("line");
      cb(choices[input - 1].value);
      return;
    }
    reRender();
  });

  // Init the prompt
  charm.write(question.message + "\r\n");
  renderChoices();

};

_cli.list = function(question, cb) {
  var selected = 0;
  var choices  = normalizeChoices(question.choices);

  function renderChoices() {
    choices.forEach(function(choice, i) {
      charm.foreground("cyan").write("  [" + (i === selected ? "X" : " ") + "] ");
      (i !== selected) && charm.foreground("white");
      charm.write(choice.name + "\r\n").foreground("white");
    });
    charm.display("dim").write("(Use arrow key)").display("reset");
  }

  // Move the selected marker on keypress
  rlVent.on("keypress", function(s, key) {
    if (key.name === "up" && (selected - 1) >= 0) {
      selected--;
    } else if (key.name === "down" && (selected + 1) < choices.length) {
      selected++;
    } else {
      return; // don't render if nothing changed
    }
    charm.erase("line");
    choices.forEach(function() {
      charm.up(1).erase("line");
    });
    renderChoices();
  });

  // Once user confirm (enter key)
  rlVent.once("line", function() {
    var choice = choices[selected];
    rlVent.removeAllListeners("keypress");
    cb(choice.value);
  });

  // Init the prompt
  charm.write(question.message + "\r\n");
  renderChoices();

};

_cli.input = function(question, cb) {

  function render() {
    charm.write(question.message);
    question.default && charm.write(" (default \"" + question.default + "\")");
    charm.write(": ");
  }

  // Once user confirm (enter key)
  rlVent.once("line", function(input) {
    var value = input || question.default || "";
    charm.up(1).erase("line");
    render();
    charm.foreground("cyan").write(value).foreground("white").write("\r\n");
    cb(value);
  });

  // Init
  render();

};

_cli.confirm = function(question, cb) {
  function render() {
    charm.write(question.message);
    charm.write(" (Y/n) ");
  }

  // Once user confirm (enter key)
  rlVent.once("line", function(input) {
    var value = true;
    if (input != null) {
      value = /^y(es)?/i.test(input);
    }
    charm.up(1);
    charm.erase("line");
    render();
    charm.foreground("cyan").write(value ? "Yes" : "No").foreground("white");
    charm.write("\r\n");
    cb(value);
  });

  // Init
  render();
};


/**
 * Public CLI helper interface
 * @param  {array}   questions  Questions settings array
 * @param  {Function} cb        Callback being passed the user answers
 * @return {null}
 */
cli.questionPrompt = function prompt(questions, allDone) {

  var rl = readline.createInterface(process.stdin, process.stdout);
  var answers = {};

  process.stdin.on("keypress", function(s, key) {
    rlVent.emit("keypress", s, key);
  });
  rl.on("line", function() {
    var args = Array.prototype.slice.call(arguments, 0);
    rlVent.emit.apply(rlVent, ["line"].concat(args));
  });

  async.mapSeries(questions,
    // Each question
    function(question, done) {
      // Callback to save answer
      var after = function(answer) {
        answers[question.name] = answer;
        done(null, answer);
      };

      console.log();

      if (_.isFunction(_cli[question.type])) {
        _cli[question.type](question, after);
      } else {
        _cli.input(question, after);
      }
    },
    // After all questions
    function() {
      rl.close();
      if (!_.isFunction(allDone)) { return; }
      allDone(answers);
    }
  );
};

