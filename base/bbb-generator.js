/**
 * BBB generator base class for Yeoman
 */

"use strict";
var util = require("util");
var path = require("path");
var yeoman = require("yeoman-generator");
var _ = require("lodash");
var grunt = require("grunt");
var esprima = require("esprima");
var escodegen = require("escodegen");
var cli = require("./cli");

/**
 * Module exports
 */

module.exports = Generator;
Generator.name = "bbb";

/**
 * BBB Generator base constructor
 * Extend Yeoman base generator
 */

function Generator(args, options, config) {
  var self = this;
  yeoman.generators.Base.apply(this, arguments);

  // Set default paths
  this.destinationRoot(process.cwd());
  this.sourceRoot(path.join(__dirname, "../templates"));

  // Extend grunt.file to namespace with source and destination directory.
  // Note: I don't like Yeoman file API, so here I use a wrapped Grunt instead.

  this.src = {};
  this.dest = {};

  _.assign(this.src, grunt.file, function(thisSrc, gruntFunc) {
    return function() {
      var src = arguments[0];
      var args = Array.prototype.slice.call(arguments, 1);

      if (!grunt.file.isPathAbsolute(src)) {
        src = path.join(this.sourceRoot(), src);
      }
      args.unshift(src);

      return gruntFunc.apply(grunt.file, args);
    }.bind(this);
  }, this);

  _.assign(this.dest, grunt.file, function(thisSrc, gruntFunc) {
    return function() {
      var src = arguments[0];
      var args = Array.prototype.slice.call(arguments, 1);

      if (!grunt.file.isPathAbsolute(src)) {
        src = path.join(this.destinationRoot(), src);
      }
      args.unshift(src);

      return gruntFunc.apply(grunt.file, args);
    }.bind(this);
  }, this);

  // Extend BBB cli
  _.assign(this, cli);

  // Get existing configurations
  var packageJSON;
  try {
    packageJSON = this.dest.readJSON("package.json");
  } catch(e) { packageJSON = {}; }
  var bbbrc;
  try {
    bbbrc = this.dest.readJSON(".bbb-rc.json");
  } catch(e) { bbbrc = {}; }

  this.pkg = packageJSON;
  this.bbb = bbbrc;

}

util.inherits(Generator, yeoman.generators.Base);

/**
 * Stringify an object and normalize whitespace with project preferences.
 * @param  {object} obj Raw object containing valid JSON value (no functions)
 * @return {string}     JSON stringified object with normalized whitespace
 */
Generator.prototype.normalizeJSON = function(obj) {
  if (!_.isObject(obj)) { throw new Error("normalizeJSON take an object"); }
  return JSON.stringify(obj, null, this.bbb.indent);
};

/**
 * Normalize a JavaScript code string with project settings
 * TODO: Enhance with style guide support
 * @param  {String} code JavaScript code contained in a String
 * @return {String}      Normalized JavaScript code (whitespace)
 */
Generator.prototype.normalizeJS = function(code) {
  var syntax;
  var output;
  try {
    syntax = esprima.parse(code, { raw: true, tokens: true, range: true, comment: true });
    syntax = escodegen.attachComments(syntax, syntax.comments, syntax.tokens);
    output = escodegen.generate(syntax, {
      comment: true,
      format: {
        indent: {
          style: this.bbb.indent
        },
        quotes: "double"
      },
    });
  } catch(e) {
    output = code;
    grunt.log.warn("Unable to parse invalid javascript file. Skipping " +
        "whitespace normalization.");
  }

  return output;
};

Generator.prototype.jamInstall = function() {
  grunt.util.spawn({
    cmd  : "jam",
    args : ["upgrade"],
    opts : { stdio: "inherit" }
  }, function() {});
};
