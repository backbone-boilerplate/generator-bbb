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

  // Make sure requirement to process this command are met. Fail otherwise.
  if (!grunt.file.isFile(path.join(this.destinationRoot(), ".bbb-rc.json"))) {
    grunt.fail.warn("You must init your project first");
    return;
  }
  if (!this.moduleName) {
    grunt.fail.warn("You must provide a name for your module");
    return;
  }
}

util.inherits(Generator, BBBGenerator);


/**
 * Generate the module file
 */

Generator.prototype.module = function module() {
  var output = this.normalizeJS(this.src.read("module." + this.bbb.moduleStyle + ".js"));
  this.write(path.join(this.bbb.paths.base, this.bbb.paths.modules, this.moduleName + ".js"), output);
};


/**
 * Generate the module related base test
 */

Generator.prototype.moduleTest = function moduleTest() {

  var testFW = this.bbb.testFramework;
  var specFolder = (testFW === "jasmine") ? "spec" : "tests";
  var ext = (testFW === "jasmine") ? ".spec.js" : ".js";
  var dest = path.join(this.bbb.paths.base, this.bbb.paths.tests, testFW, specFolder, this.moduleName + ext);

  var srcText = this.src.read("test." + testFW + ".js");
  var script = _.template(srcText)({
    moduleName : this.moduleName,
    modulePath : "app/modules/" + this.moduleName
  });

  this.dest.write(dest, this.normalizeJS(script));
};
