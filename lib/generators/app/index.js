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
Generator._name = "bbb:app";

/**
 * BBB Generator constructor
 * Extend the bbb:init generator
 * Launch packages manager once the installation ends
 */

function Generator(args, options, config) {

  // Extend parents generator/class
  InitGenerator.apply(this, arguments);

  // Use BBB fetched via NPM as source root for the app task
  this.sourceRoot(path.join(__dirname, "../../../node_modules/backbone-boilerplate/"));

  // Get source package.json relevant information
  var bbbPkg = _.pick(this.src.readJSON("package.json"), "dependencies", "jam");
  _.extend(this.pkg, bbbPkg);

  // Launch packages manager once the installation ends
  this.on("end", function () {
    if( options["skip-install"] ) {
      return;
    }

    this.jamInstall();
    this.bowerInstall();
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

/**
 * Copy boilerplate main code
 * all `app/` folder, index.html and favicon
 */

Generator.prototype.app = function app() {
  this.dest.mkdir(path.join(this.bbb.get("paths").base, "vendor"));

  this.src.recurse("app", function( abspath, rootdir, subdir, filename ) {
    var code = grunt.file.read(abspath);
    var dest = path.join(this.bbb.get("paths").base, "app", filename);

    // Manage app.js elsewhere
    if (filename === "app.js") {
      return;
    }

    if (abspath.slice(-3) === ".js") {
      code = this.normalizeJS(code);
    }

    if (abspath.slice(-5) === ".html") {
      code = this.normalizeHTML(code);
    }

    if (subdir != null) {
      dest = path.join(this.bbb.get("paths").base, "app", subdir, filename);
    }

    this.dest.write(dest, code);
  }.bind(this));

  this.dest.write("README.md", "");
  this.dest.write("index.html", this.normalizeHTML(this.src.read("index.html")));
  this.dest.copy("favicon.ico", path.join(this.bbb.get("paths").base, "favicon.ico"));
};

/**
 * Generate the `app/app.js` file
 * Manage Templating engine
 */

Generator.prototype.genAppJs = function genAppJs() {
  var self = this;
  var appFile = this.src.read("app/app.js");

  if (this.bbb.get("templateEngine") === "handlebars") {
    appFile = falafel(appFile, function(node) {
      if (node.type === "ExpressionStatement" &&
          node.expression.type === "CallExpression" &&
          node.expression.callee.type === "MemberExpression" &&
          node.expression.callee.object.name === "LayoutManager" &&
          node.expression.callee.property.name === "configure") {
        var LMConfig = node.expression.arguments[0];

        var fetchConf = _.filter(LMConfig.properties, function(n) {
          return n.key.name === "fetch";
        })[0].value;

        fetchConf.update(path.join(__dirname,
            "../../templates/partial.handlebars-fetch.js"));
      }
    });
  }

  this.dest.write(path.join(this.bbb.get("paths").base, "app/app.js"), this.normalizeJS(appFile));
};

/**
 * Generate the Packages Managers configurations
 */

Generator.prototype.genPackageManager = function genPackageManager() {
  // Bower
  var comp = this.src.readJSON("bower.json");
  this.dest.write("bower.json", this.normalizeJSON(comp));
  var bowerrc = this.src.readJSON(".bowerrc");
  bowerrc.directory = path.join(this.bbb.get("paths").base, bowerrc.directory).replace(/\\\\/g, "/");
  this.dest.write(".bowerrc", this.normalizeJSON(bowerrc));
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
  var root = "test/" + this.bbb.get("testFramework");
  this.src.recurse(root, function( abspath, rootdir, subdir, filename ) {
    var code = grunt.file.read(abspath);
    var dest = path.join(this.bbb.get("paths").base, root, filename);

    if (abspath.slice(-3) === ".js") {
      code = this.normalizeJS(code);
    }

    if (abspath.slice(-5) === ".html") {
      code = this.normalizeHTML(code);
    }

    if (subdir != null) {
      dest = path.join(this.bbb.get("paths").base, root, subdir, filename);
    }

    this.dest.write(dest, code);
  }.bind(this));
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

  if (this.bbb.get("templateEngine") === "handlebars") {
    this.pkg.jam.dependencies.handlebars = "1.0.0-beta.6.jam.1";
  }

  this.pkg.jam.packageDir = path.join(this.bbb.get("paths").base, this.pkg.jam.packageDir).replace(/\\\\/g, "/");

  this.dest.write("package.json", this.normalizeJSON(this.pkg));
};
