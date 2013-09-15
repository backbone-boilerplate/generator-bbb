/**
 * BBB generator base class for Yeoman
 */

"use strict";
var util = require("util");
var path = require("path");
var yeoman = require("yeoman-generator");
var _ = require("lodash");
var beautify = require("js-beautify");
var File = require("./file");


/**
 * Module exports
 */

module.exports = Generator;
Generator._name = "bbb";


/**
 * BBB Generator base constructor
 * Extend Yeoman base generator
 */

function Generator(args, options, config) {
  var self = this;
  yeoman.generators.Base.apply(this, arguments);

  // Set default paths
  this.destinationRoot(process.cwd());
  this.sourceRoot(path.join(__dirname, "../../templates"));

  // Extend grunt.file to namespace with source and destination directory.
  // Note: I don't like Yeoman file API, so here I use a wrapped Grunt instead.
  this.src = new File(this.sourceRoot(), this);
  this.dest = new File(this.destinationRoot(), this, true);

  // Get existing configurations
  var packageJSON;
  try {
    packageJSON = this.dest.readJSON("package.json");
  } catch(e) { packageJSON = {}; }

  this.pkg = packageJSON;

  this.config.defaults({
    name           : "",
    testFramework  : "qunit",
    moduleStyle    : "amd",
    indent: {
      char : "space",
      size : 2
    },
    paths: {
      base    : ".",
      tests   : "test",
      modules : "app/modules"
    }
  });

}

util.inherits(Generator, yeoman.generators.Base);


/**
 * Stringify an object and normalize whitespace with project preferences.
 * @param  {object} obj Raw object containing valid JSON value (no functions)
 * @return {string}     JSON stringified object with normalized whitespace
 */

Generator.prototype.normalizeJSON = function(obj) {
  if (!_.isObject(obj)) { throw new Error("normalizeJSON take an object"); }
  var qte = this.config.get("indent").size || 1;
  var indentChar = (this.config.get("indent").char === "space") ? " " : "\t";
  var indent = "";
  while (qte--) {
    indent += indentChar;
  }
  return JSON.stringify(obj, null, indent);
};


/**
 * Normalize a JavaScript code string with project settings
 * TODO: Enhance with style guide support
 * @param  {String} code JavaScript code contained in a String
 * @return {String}      Normalized JavaScript code
 */

Generator.prototype.normalizeJS = function(code) {
  return beautify.js_beautify(code.toString(), {
    "indent_size"               : this.config.get("indent").size,
    "indent_char"               : this.config.get("indent").char === "space" ? " " : "\t",
    "indent_with_tabs"          : this.config.get("indent").char === "space" ? false : true,
    "keep_array_indentation"    : true,
    "keep_function_indentation" : true,
    "space_before_conditional"  : true,
    "preserve_newlines"         : true,
    "break_chained_methods"     : false
  });
};


/**
 * Normalize a HTML code string with project settings
 * @param  {String} code HTML code contained in a String
 * @return {String}      Normalized HTML code
 */

Generator.prototype.normalizeHTML = function(code) {
  return beautify.html(code.toString(), {
    "indent_size"       : this.config.get("indent").size,
    "indent_char"       : this.config.get("indent").char === "space" ? " " : "\t",
    "preserve_newlines" : true,
    "wrap_line_length"  : 0
  });
};


// Wrap path functions to update the Files methods
Generator.prototype.sourceRoot = function() {
  var path = yeoman.generators.Base.prototype.sourceRoot.apply(this, arguments);
  this.src = new File(path, this);
  return path;
};

Generator.prototype.destinationRoot = function() {
  var path = yeoman.generators.Base.prototype.destinationRoot.apply(this, arguments);
  this.dest = new File(path, this);
  return path;
};
