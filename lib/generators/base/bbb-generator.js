/**
 * BBB generator base class for Yeoman
 */

"use strict";
var util = require("util");
var path = require("path");
var yo = require("yeoman-generator");
var _ = require("lodash");
var beautify = require("js-beautify");


/**
 * BBB Generator base constructor
 * Extend Yeoman base generator
 */

var Generator = yo.generators.Base.extend({

  constructor: function() {
    yo.generators.Base.apply(this, arguments);

    // Set default paths
    this.destinationRoot(process.cwd());
    this.sourceRoot(path.join(__dirname, "../../templates"));

    // Set writing filters
    this.dest.registerWriteFilter("normalizeJS", this.filterNormalizeJS.bind(this));
    this.dest.registerWriteFilter("normalizeJSON", this.filterNormalizeJSON.bind(this));
    this.dest.registerWriteFilter("normalizeHTML", this.filterNormalizeHTML.bind(this));
    this.src.registerWriteFilter("normalizeJS", this.filterNormalizeJS.bind(this));
    this.src.registerWriteFilter("normalizeJSON", this.filterNormalizeJSON.bind(this));
    this.src.registerWriteFilter("normalizeHTML", this.filterNormalizeHTML.bind(this));

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
        style : "space",
        size : 2
      },
      paths: {
        base    : ".",
        tests   : "test",
        modules : "app/modules"
      }
    });
  },

  /**
   * Stringify an object and normalize whitespace with project preferences.
   * @param  {object} obj Raw object containing valid JSON value (no functions)
   * @return {string}     JSON stringified object with normalized whitespace
   */

  normalizeJSON: function(obj) {
    if (!_.isObject(obj)) { throw new Error("normalizeJSON take an object"); }
    var qte = this.config.get("indent").size || 1;
    var indentChar = (this.config.get("indent").style === "space") ? " " : "\t";
    var indent = "";
    while (qte--) {
      indent += indentChar;
    }
    return JSON.stringify(obj, null, indent);
  },

  filterNormalizeJSON: function(data) {
    if (path.extname(data.path) !== ".json") {
      return data;
    }

    data.contents = this.normalizeJSON(JSON.parse(data.contents));
    return data;
  },


  /**
   * Normalize a JavaScript code string with project settings
   * TODO: Enhance with style guide support
   * @param  {String} code JavaScript code contained in a String
   * @return {String}      Normalized JavaScript code
   */

  normalizeJS: function(code) {
    return beautify.js_beautify(code.toString(), {
      "indent_size"               : this.config.get("indent").size,
      "indent_char"               : this.config.get("indent").style === "space" ? " " : "\t",
      "indent_with_tabs"          : this.config.get("indent").style === "space" ? false : true,
      "keep_array_indentation"    : true,
      "keep_function_indentation" : true,
      "space_before_conditional"  : true,
      "preserve_newlines"         : true,
      "break_chained_methods"     : false
    });
  },

  filterNormalizeJS: function(data) {
    if (path.extname(data.path) !== ".js") {
      return data;
    }

    data.contents = this.normalizeJS(data.contents);
    return data;
  },


  /**
   * Normalize a HTML code string with project settings
   * @param  {String} code HTML code contained in a String
   * @return {String}      Normalized HTML code
   */

  normalizeHTML: function(code) {
    return beautify.html(code.toString(), {
      "indent_size"       : this.config.get("indent").size || 1,
      "indent_char"       : this.config.get("indent").style === "space" ? " " : "\t",
      "preserve_newlines" : true,
      "wrap_line_length"  : 0
    });
  },

  filterNormalizeHTML: function(data) {
    if (path.extname(data.path) !== ".html") {
      return data;
    }

    data.contents = this.normalizeHTML(data.contents);
    return data;
  }

});

Generator._name = "bbb";
module.exports = Generator;


