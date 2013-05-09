/**
 * BBB generator for Yeoman
 */

"use strict";
var util = require("util");
var path = require("path");
var _ = require("lodash");
var grunt = require("grunt");
var BBBGenerator = require("../base/bbb-generator");

/**
 * Module exports
 */

module.exports = Generator;

/**
 * BBB Generator constructor
 * Extend Yeoman base generator
 * Launch packages manager once the installation ends
 */

function Generator(args, options, config) {
  BBBGenerator.apply(this, arguments);
}

util.inherits(Generator, BBBGenerator);

/**
 * Command prompt questions
 * Extend defaults and options based on user answers
 */

Generator.prototype.askFor = function askFor() {
  var done = this.async();

  console.log(
    "\n    .-~0~-." +
    "\n   /   ___ \\ " +
    "\n   |  ( _ )|       ~~ Backbone-Boilerplate ~~" +
    "\n .-' (C) (C)`-  Welcome to the project generator" +
    "\n   |   .---.           Have a good time!" +
    "\n   |  / .-. \\ " +
    "\n   |  \\ `-' / " +
    "\n   |   `---'" +
    "\n __|_______|___ \n"
  );

  var prompts = [];

  !this.bbb.name && prompts.push({
    name: "name",
    message: "Your project name:",
    default: this.appname // Default to current folder name
  });

  !this.bbb.testFramework && prompts.push({
    name: "testFramework",
    message: "Which test framework do you want to use?" +
      "\n 1) QUnit" +
      "\n 2) Mocha" +
      "\n 3) Jasmine" +
      "\n Default: ",
    default: "1"
  });

  !this.bbb.packageManager && prompts.push({
    name: "packageManager",
    message: "Which package manager do you want to use?" +
      "\n 1) Jam" +
      "\n 2) Bower" +
      "\n 3) None" +
      "\n Default: ",
    default: "1"
  });

  !this.bbb.indent && prompts.push({
    name: "indent",
    message: "What about indentation?" +
      "\n 1) Spaces (2)" +
      "\n 2) Spaces (4)" +
      "\n 3) Tabs" +
      "\n Default: ",
    default: "1"
  });

  var testFrameworks = {
    1: "qunit",
    2: "mocha",
    3: "jasmine"
  };

  var packageManagers = {
    1: "jam",
    2: "bower",
    3: "none"
  };

  var indents = {
    1: "  ",
    3: "    ",
    2: "\t"
  };

  this.prompt(prompts, function (err, props) {
    if (err) {
      return this.emit("error", err);
    }

    _.each(props, function(val, name) {
      if (name === "testFramework") {
        this.bbb.testFramework = testFrameworks[val];
      } else if (name === "packageManager") {
        this.bbb.packageManager = packageManagers[val];
      } else if (name === "indent") {
        this.bbb.indent = indents[val];
      } else {
        this.bbb[name] = val;
      }
    }, this);

    this.pkg.name = this.bbb.name;

    done();
  }.bind(this));
};

/**
 * Save the current configuration inside `.bbbrc` files so sub-generator can use it too
 */

Generator.prototype.saveConfig = function saveConfig() {
  this.dest.write(".bbb-rc.json", this.normalizeJSON(this.bbb));
};
