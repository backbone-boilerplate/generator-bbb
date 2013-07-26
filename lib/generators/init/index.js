/**
 * BBB `init` generator for Yeoman
 * Initialize a project configuration file.
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
Generator._name = "bbb:init";

/**
 * BBB Generator constructor
 * Extend Yeoman base generator
 */

function Generator(args, options, config) {

  // Set project destination path. As the init generator can take a path argument,
  // this **must** happen before anything else
  if (_.isString(args[0])) {
    grunt.file.mkdir(args[0]);
    process.chdir(args[0]);
  }

  // Extend parents generator/class
  BBBGenerator.apply(this, arguments);

  // Infer default project name from the folder name
  this.appname = _.last(this.destinationRoot().split(/[\/\\]/g));
}

util.inherits(Generator, BBBGenerator);

/**
 * Command prompt questions
 * Extend defaults and options based on user answers
 */

Generator.prototype.askFor = function askFor() {
  var done = this.async();

  var force = false;
  if (this.constructor._name === "bbb:init" || !this.config.existed) {
    force = true;
  }

  // Display the BBB ASCII
  console.log(grunt.file.read(path.join(__dirname, "../../../ascii.txt")));

  var prompts = [];

  (!this.bbb.get("name") || force) && prompts.push({
    type    : "input",
    name    : "name",
    message : "Your project name",
    default : this.appname // Default to current folder name
  });

  (!this.bbb.get("testFramework") || force) && prompts.push({
    name    : "testFramework",
    type    : "list",
    message : "Which test framework do you want to use?",
    choices : [ "Mocha", "QUnit", "Jasmine" ],
    filter  : function(v) { return v.toLowerCase(); }
  });

  (!this.bbb.get("moduleStyle") || force) && prompts.push({
    name    : "moduleStyle",
    type    : "list",
    message : "Choose your module style",
    choices : [ "CommonJS", "AMD" ],
    filter  : function(v) { return v.toLowerCase(); }
  });

  (!this.bbb.get("templateEngine") || force) && prompts.push({
    name    : "templateEngine",
    type    : "list",
    message : "Choose your template engine",
    choices : [ "Underscore", "Handlebars" ],
    filter  : function(v) { return v.toLowerCase(); }
  });

  (!this.bbb.get("indent") || force) && prompts.push({
    name: "indent",
    type: "list",
    message: "What about indentation?",
    choices: [{
      name: "Spaces (2)",
      value: {
        char : "space",
        size : 2
      }
    }, {
      name: "Spaces (4)",
      value: {
        char : "space",
        size : 4
      }
    }, {
      name: "Tabs",
      value: {
        char : "tab",
        size : 1
      }
    }]
  });

  this.prompt(prompts, function (props) {
    this.bbb.set(props);
    this.pkg.name = this.bbb.get("name");

    done();
  }.bind(this));
};
