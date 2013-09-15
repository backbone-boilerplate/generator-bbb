/**
 * BBB `module` generator for Yeoman
 * Initialize a single module file and related test.
 */

"use strict";
var util = require("util");
var path = require("path");
var _ = require("lodash");
var grunt = require("grunt");
var Tree = require("ast-query");
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
  if (!this.config.existed) {
    grunt.fail.fatal("You must init your project first");
    return;
  }

  if (!this.moduleName) {
    grunt.fail.fatal("You must provide a name for your module");
    return;
  }

  switch (true) {
    case this.options.amd:
      this.moduleStyle = "amd";
      break;
    case this.options.cjs:
    case this.options.commonjs:
      this.moduleStyle = "commonjs";
      break;
    default:
      this.moduleStyle = this.config.get("moduleStyle");
  }
}

util.inherits(Generator, BBBGenerator);


/**
 * Generate the module file
 */

Generator.prototype.module = function module() {
  var output = this.normalizeJS(this.src.read(
      "module." + this.config.get("moduleStyle") + ".js"));
  this.write(path.join(
    this.config.get("paths").base,
    this.config.get("paths").modules,
    this.moduleName + ".js"), output);
};


/**
 * Generate the module related base test
 */

Generator.prototype.moduleTest = function moduleTest() {
  var self = this;
  var testFW = this.config.get("testFramework");

  if (!testFW || testFW === "none") return;

  // Create test file
  var testFolder = path.join(this.config.get("paths").base, this.config.get("paths").tests, testFW);
  var testRunnerPath = path.join(testFolder, "specs.js");
  var ext = (testFW === "jasmine") ? ".spec.js" : ".js";
  var dest = path.join(this.config.get("paths").base, this.config.get("paths").tests, testFW,
      "spec", this.moduleName + ext);

  var srcText = this.src.read("test." + testFW + "." + this.moduleStyle + ".js");
  var script = _.template(srcText)({
    moduleName : this.moduleName,
    modulePath : "modules/" + this.moduleName
  });

  this.dest.write(dest, this.normalizeJS(script));

  // Add test file to the karma conf
  var tree = new Tree(this.dest.read(testRunnerPath));
  tree.object().passedTo("define").key("specs").value(function (currentVal) {
    /*jshint evil:true */
    var tests = eval(currentVal);
    tests.push("spec/" + self.moduleName);
    return self.normalizeJSON(tests);
  });

  this.dest.write(path.join(testFolder, "specs.js"), this.normalizeJS(tree.toString()));
};
