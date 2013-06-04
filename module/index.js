/**
 * BBB `module` generator for Yeoman
 * Initialize a single module file and related test.
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
Generator._name = "bbb:module";


/**
 * BBB Generator constructor
 * Extend Yeoman base generator
 */

function Generator(args, options, config) {
  BBBGenerator.apply(this, arguments);

  this.moduleName = args[0];
}

util.inherits(Generator, BBBGenerator);


/**
 * Generate the module file
 */

Generator.prototype.module = function module() {

  if (!this.bbb) {
    grunt.log.error("You must init your project first");
    return;
  }
  if (!this.moduleName) {
    grunt.log.error("You must provide a name for your module");
    return;
  }

  var output = this.normalizeJS(this.src.read("module." + this.bbb.moduleStyle + ".js"));
  this.write("app/modules/" + this.moduleName + ".js", output);
};


/**
 * Generate the module related base test
 */

Generator.prototype.moduleTest = function moduleTest() {

  var testFW = this.bbb.testFramework;
  var specFolder = (testFW === "jasmine") ? "spec" : "tests";
  var dest = path.join("test", testFW, specFolder, this.moduleName + ".js");

  var srcText = this.src.read("test." + testFW + ".js");
  var script = _.template(srcText)({
    moduleName : this.moduleName,
    modulePath : "app/modules/" + this.moduleName
  });

  this.dest.write(dest, this.normalizeJS(script));
};
