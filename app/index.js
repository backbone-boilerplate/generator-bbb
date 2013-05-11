/**
 * BBB `app` generator for Yeoman
 * Scaffhold the project structure
 */

"use strict";
var util = require("util");
var path = require("path");
var falafel = require("falafel");
var _ = require("lodash");
var grunt = require("grunt");
var InitGenerator = require("../init/index");

/**
 * Module exports
 */

module.exports = Generator;
Generator.name = "bbb";

/**
 * BBB Generator constructor
 * Extend the bbb:init generator
 * Launch packages manager once the installation ends
 */

function Generator(args, options, config) {

  // Extend parents generator/class
  InitGenerator.apply(this, arguments);

  // Use BBB fetched via NPM as source root for the app task
  this.sourceRoot(path.join(__dirname, "../node_modules/backbone-boilerplate/"));

  // Get source package.json relevant information
  var bbbPkg = _.pick(this.src.readJSON("package.json"), "dependencies", "jam");
  _.extend(this.pkg, bbbPkg);

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

util.inherits(Generator, InitGenerator);

/**
 * Command prompt questions
 * Note: Directly extend these functions on the generator prototype as Yeoman run every
 * direct prototype attached method (e.g.: `.hasOwnProperty()`)
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
      code = self.normalizeJS(code);
    }

    if (subdir != null) {
      dest = path.join("app", subdir, filename);
    }

    self.dest.write(dest, code);
  });

  this.dest.write("README.md", "");
  this.copy("index.html", "index.html");
  this.copy("favicon.ico", "favicon.ico");
};

/**
 * Generate the Packages Managers configurations
 */

Generator.prototype.genPackageManager = function genPackageManager() {
  // Bower
  if (this.bbb.packageManager === "bower") {
    var comp = this.src.readJSON("component.json");
    this.dest.write("component.json", this.normalizeJSON(comp));
    var bowerrc = this.src.readJSON(".bowerrc");
    this.dest.write(".bowerrc", this.normalizeJSON(bowerrc));
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

  this.dest.write("Gruntfile.js", this.normalizeJS(output));

};

/**
 * Scaffhold the test directory
 */

Generator.prototype.testScaffholding = function testScaffholding() {
  this.directory("test/"+ this.bbb.testFramework, "test/"+ this.bbb.testFramework, true);
};

/**
 * Generate git related files
 */

Generator.prototype.generateGit = function generateGit() {
  this.dest.write(".gitignore", "/dist/\n/node_modules/");
};

/**
 * Generate the `package.json` file
 */

Generator.prototype.genPackageJSON = function genPackageJSON() {
  // Set package settings
  this.pkg.name = this._.slugify(this.pkg.name);
  this.pkg.version = "0.0.0";

  this.dest.write("package.json", this.normalizeJSON(this.pkg));
};
