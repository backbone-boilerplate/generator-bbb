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
 * Client interfaces
 */

_cli.list = function(question, cb) {
  var choices = _.map(question.choices, function(val) {
    if (_.isString(val)) {
      return val;
    }
    return val.name;
  });

  grunt.log.writeln(question.message);
  commander.choose(choices, function(i) {
    cb(null, {
      name: question.name,
      value: question.choices[i].value || question.choices[i]
    });
  });
};

_cli.checkbox = function(question, cb) {
  var selected = 0;
  var choices = question.choices;

  function renderChoices() {
    choices.forEach(function( choice, i ) {
      charm.foreground("cyan");
      charm.write("[" + (i === selected ? "X" : " ") + "] ");
      (i !== selected) && charm.foreground("white");
      charm.write(choice.name + "\r\n");
      charm.foreground("white");
    });
  }

  // Move the selected marker on keypress
  rlVent.on("keypress", function(s, key) {
    if( key.name === "up" && (selected - 1) >= 0 ) {
      selected--;
    } else if( key.name === "down" && (selected + 1) < choices.length ){
      selected++;
    } else {
      return; // don't render if nothing changed
    }
    charm.erase("line");
    question.choices.forEach(function() {
      charm.up(1);
      charm.erase("line");
    });
    renderChoices();
  });

  // Init the prompt
  charm.write(question.message + "\r\n");
  renderChoices();

};

_cli.input = function(question, cb) {
  commander.prompt(question.message + " (default \"" + question.default + "\") ", function(value) {
    if (!value.length) {
      value = question.default;
    }
    cb(null, {
      name: question.name,
      value: value
    });
  });
};

_cli.confirm = function() {

};


/**
 * Public Yeoman interface
 * @param  {array}   questions  Questions settings array
 * @param  {Function} cb        Callback being passed the user answers
 * @return {null}
 */
cli.questionPrompt = function prompt(questions, cb) {

  var rl = readline.createInterface(process.stdin, process.stdout);

  process.stdin.on("keypress", function(s, key) {
    rlVent.emit("keypress", s, key);
  });
  rl.on("line", function(line) {
    rlVent.emit("line");
  });

  async.mapSeries(questions, function(question, done) {
    if (_.isFunction(_cli[question.type])) {
      _cli[question.type](question, done);
    } else {
      _cli.input(question, done);
    }
  }, function() {
    rl.close();
    if (_.isFunction(done)) {
      done.apply(null, arguments);
    }
  });
};

