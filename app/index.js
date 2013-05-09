/**
 * BBB generator for Yeoman
 */

"use strict";
var util = require("util");
var path = require("path");
var falafel = require("falafel");
var _ = require("lodash");
var grunt = require("grunt");
var BBBGenerator = require("../base/bbb-generator");
var InitGenerator = require("../init/index");

/**
 * Module exports
 */

module.exports = Generator;
Generator.name = "bbb";

/**
 * BBB Generator constructor
 * Extend Yeoman base generator
 * Launch packages manager once the installation ends
 */

function Generator(args, options, config) {
  var self = this;
  BBBGenerator.apply(this, arguments);
  InitGenerator.apply(this, arguments);

  // Setup destination directory
  if (_.isString(args[0])) {
    if (grunt.file.isPathAbsolute(args[0])) {
      grunt.file.mkdir(args[0]);
      this.destinationRoot(args[0]);
    } else {
      this.dest.mkdir(args[0]);
      this.destinationRoot(path.join(process.cwd(), args[0]));
    }
  }

  // Infer default project name from the folder name
  this.appname = _.last(this.destinationRoot().split(/[\/\\]/g));

  // Launch packages manager once the installation ends
  this.on("end", function () {
    if( options["skip-install"] ) {
      return;
    }

    if (this.bbb.packageManager === "jam") {
      grunt.util.spawn({
        cmd  : "jam",
        args : ["upgrade"],
        opts : { stdio: "inherit" }
      }, function() {});
    } else if (this.bbb.packageManager === "bower") {
      this.bowerInstall ();
    }

    this.npmInstall();
  }.bind(this));
}

util.inherits(Generator, BBBGenerator);

/**
 * Command prompt questions
 * Note: Directly extend these functions on the generator prototype as Yeoman run every
 * attached method (e.g.: `.hasOwnProperty()`)
 */

Generator.prototype.askFor = InitGenerator.prototype.askFor;
Generator.prototype.saveConfig = InitGenerator.prototype.saveConfig;

/**
 * Copy boilerplate main code
 * all `app/` folder, index.html and favicon
 */

Generator.prototype.app = function app() {
  var self = this;
  this.mkdir("vendor");

  this.src.recurse("app", function( abspath, rootdir, subdir, filename ) {
    var code = grunt.file.read(abspath);
    var dest = path.join("app", filename);

    if (abspath.slice(-3) === ".js") {
      code = self.helper.normalizeJS(code);
    }

    if (subdir != null) {
      dest = path.join("app", subdir, filename);
    }

    self.dest.write(dest, code);
  });

  this.copy("index.html", "index.html");
  this.copy("favicon.ico", "favicon.ico");
};

/**
 * Generate the Package Manager configuration
 */

Generator.prototype.genPackageManager = function genPackageManager() {
  // Bower
  if (this.bbb.packageManager === "bower") {
    var comp = this.src.readJSON("_component.json");
    this.dest.write("component.json", this.helper.normalizeJSON(comp));
    var bowerrc = this.src.readJSON("_bowerrc");
    this.dest.write(".bowerrc", this.helper.normalizeJSON(bowerrc));
  }

  // Delete Jam configuration if not used
  if (this.bbb.packageManager !== "jam") {
    delete this.pkg.jam;
  }
};

/**
 * Generate the Gruntfile
 * Note: Use `falafel` to recurse over the Gruntfile AST and set only relevant configs
 */

Generator.prototype.genGruntfile = function genGruntfile() {
  var self = this;

  var output = falafel(this.src.read("Gruntfile.js"), function(node) {
    if (node.type === "CallExpression" &&
        node.callee.object.name === "grunt" &&
        node.callee.property.name === "initConfig") {
      var gruntConfig = node.arguments[0];

      var karmaConf = _.filter(gruntConfig.properties, function(n) {
        return n.key.name === "karma";
      })[0].value;

      // Loop through karma configuration options and delete unused test framework
      _.each(karmaConf.properties, function(node) {
        if (node.key.name !== self.bbb.testFramework && node.key.name !== "options") {
          node.update("");
        }
      });

      // Delete remaining commas and extra whitespace
      var source = karmaConf.source()
        .replace(/(?!,)([\s\r\n]*,)/g, "") // two comma following each other `,,`
        .replace(/(,(?=[\s\r\n]*})+)/g, "") // ending comma e.g. `,}`
        .replace(/(?![\r\n]+)(\s*[\r\n]+)/g, ""); // two line break following
      karmaConf.update(source);
    }
  });

  this.dest.write("Gruntfile.js", this.helper.normalizeJS(output));

};

/**
 * Scaffhold the test directory
 */

Generator.prototype.testScaffholding = function testScaffholding() {
  this.directory("test/"+ this.bbb.testFramework, "test/"+ this.bbb.testFramework, true);
};

/**
 * Generate the `package.json` file
 */

Generator.prototype.genPackageJSON = function genPackageJSON() {
  // Set package settings
  this.pkg.name = this._.slugify(this.pkg.name);
  this.pkg.version = "0.0.0";

  this.dest.write("package.json", this.helper.normalizeJSON(this.pkg));
};
