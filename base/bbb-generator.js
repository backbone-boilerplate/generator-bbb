/**
 * BBB generator base class for Yeoman
 */

"use strict";
var util = require("util");
var path = require("path");
var yeoman = require("yeoman-generator");
var _ = require("lodash");
var grunt = require("grunt");

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

      src = path.join(this.sourceRoot(), src);
      args.unshift(src);

      return gruntFunc.apply(grunt.file, args);
    }.bind(this);
  }, this);

  _.assign(this.dest, grunt.file, function(thisSrc, gruntFunc) {
    return function() {
      var src = arguments[0];
      var args = Array.prototype.slice.call(arguments, 1);

      src = path.join(this.destinationRoot(), src);
      args.unshift(src);

      return gruntFunc.apply(grunt.file, args);
    }.bind(this);
  }, this);

  // Attach helper functions
  this.helper = {};

  this.helper.normalizeJSON = function(obj) {
    if (!_.isObject(obj)) { throw new Error("normalizeJSON take an object"); }
    return JSON.stringify(obj, null, self.bbb.indent);
  };

  // Get existing configurations
  var packageJSON;
  try {
    packageJSON = this.dest.readJSON("package.json");
  } catch(e) { packageJSON = {}; }
  var bbbrc;
  try {
    bbbrc = this.dest.readJSON(".bbb-rc.json");
  } catch(e) { bbbrc = {}; }

  this.pkg = _.extend(this.src.readJSON("_package.json"), packageJSON);
  this.bbb = bbbrc;

}

util.inherits(Generator, yeoman.generators.Base);
