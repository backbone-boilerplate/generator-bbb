/**
 * BBB `module` generator for Yeoman
 * Initialize a single module file and related test.
 */

"use strict";
var util = require("util");
var path = require("path");
var _ = require("lodash");
var grunt = require("grunt");
var falafel = require("falafel");
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
      this.moduleStyle = this.bbb.moduleStyle;
  }
}

util.inherits(Generator, BBBGenerator);


/**
 * Generate the module file
 */

Generator.prototype.module = function module() {
  var output = this.normalizeJS(this.src.read("module." + this.moduleStyle + ".js"));
  this.write(path.join(this.bbb.paths.base, this.bbb.paths.modules, this.moduleName + ".js"), output);
};


/**
 * Generate the module related base test
 */

Generator.prototype.moduleTest = function moduleTest() {

  var testFW = this.bbb.testFramework;

  if (!testFW || testFW === "none") return;

  // Create test file
  var testFolder = path.join(this.bbb.paths.base, this.bbb.paths.tests, testFW);
  var specFolder = (testFW === "jasmine") ? "spec" : "tests";
  var testRunnerPath = path.join(testFolder, "test-runner.js");
  var ext = (testFW === "jasmine") ? ".spec.js" : ".js";
  var dest = path.join(this.bbb.paths.base, this.bbb.paths.tests, testFW,
      specFolder, this.moduleName + ext);

  var srcText = this.src.read("test." + testFW + ".js");
  var script = _.template(srcText)({
    moduleName : this.moduleName,
    modulePath : "app/modules/" + this.moduleName
  });

  this.dest.write(dest, this.normalizeJS(script));

  // Add test file to the karma conf
  var testRunner = this.dest.read(testRunnerPath);

  var runnerContent = falafel(testRunner, function(node) {
    /*jshint evil:true */
    if (node.type === "ArrayExpression" &&
        node.parent && node.parent.type === "VariableDeclarator" &&
        (node.parent.id.name === "tests" || node.parent.id.name === "specs")) {
      var tests = eval(node.source()); // eval to ignore comments
      tests.push(specFolder + "/" + this.moduleName);
      node.update(this.normalizeJSON(tests));
    }
  }.bind(this));

  this.dest.write(path.join(testFolder, "test-runner.js"),
      this.normalizeJS(runnerContent));
};
