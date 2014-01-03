/**
 * BBB `module` generator for Yeoman
 * Initialize a single module file and related test.
 */

"use strict";
var util = require("util");
var path = require("path");
var _ = require("lodash");
var Tree = require("ast-query");
var BBBGenerator = require("../base/bbb-generator");


/**
 * BBB Generator constructor
 * Extend Yeoman base generator
 */

var Generator = BBBGenerator.extend({

  constructor: function (args, options, config) {
    BBBGenerator.apply(this, arguments);

    this.moduleName = args[0];

    // Make sure requirement to process this command are met. Fail otherwise.
    if (!this.config.existed) {
      throw new Error("You must init your project first");
    }

    if (!this.moduleName) {
      throw new Error("You must provide a name for your module");
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
  },

  /**
   * Generate the module file
   */

  module: function module() {
    var output = this.src.read("module." + this.config.get("moduleStyle") + ".js");
    this.dest.write(path.join(this.config.get("paths").base, this.config.get("paths").modules,
        this.moduleName + ".js"), output);
  },


  /**
   * Generate the module related base test
   */

  moduleTest: function moduleTest() {
    var testFW = this.config.get("testFramework");
    var moduleStyle = this.config.get("moduleStyle");

    if (!testFW || testFW === "none") return;

    var testFolder = path.join(
      this.config.get("paths").base,
      this.config.get("paths").tests,
      testFW
    );

    var ext = ".spec.js";
    var dest = path.join(testFolder, "specs", this.moduleName + ext);

    // Get the correct template.
    var srcText = this.src.read("test." + testFW + "." + moduleStyle + ".js");
    var script = _.template(srcText)({
      moduleName : this.moduleName,
      modulePath : "modules/" + this.moduleName
    });

    // Create test file
    this.dest.write(dest, script);
  }

});

module.exports = Generator;
Generator._name = "bbb:module";

