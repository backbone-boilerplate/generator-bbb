/**
 * BBB `app` generator for Yeoman
 * Scaffold the project structure
 */

"use strict";
var util = require("util");
var path = require("path");
var _ = require("lodash");
var grunt = require("grunt");
var Tree = require("ast-query");
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
  var bbbPkg = _.pick(this.src.readJSON("package.json"),
      "devDependencies", "peerDependencies", "scripts");

  _.extend(this.pkg, bbbPkg);

  // Launch packages manager once the installation ends
  this.on("end", function () {
    if( options["skip-install"] ) {
      return;
    }

    this.bowerInstall(undefined, { quiet: true });
    this.npmInstall(undefined, { quiet: true });
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
  this.dest.mkdir(path.join(this.config.get("paths").base, "vendor"));

  this.src.recurse("app", function( abspath, rootdir, subdir, filename ) {
    var code = grunt.file.read(abspath);
    var dest = path.join(this.config.get("paths").base, "app", filename);

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
      dest = path.join(this.config.get("paths").base, "app", subdir, filename);
    }

    this.dest.write(dest, code);
  }.bind(this));

  this.dest.write("README.md", "");
  this.dest.write(path.join(this.config.get("paths").base, "index.html"),
      this.normalizeHTML(this.src.read("index.html")));
};

/**
 * Generate the `app/app.js` file
 * Manage Templating engine
 */

Generator.prototype.genAppJs = function genAppJs() {
  var self = this;
  var appFile = this.src.read("app/app.js");

  this.dest.write(path.join(this.config.get("paths").base, "app/app.js"), this.normalizeJS(appFile));
};

/**
 * Generate the Packages Managers configurations
 */

Generator.prototype.genPackageManager = function genPackageManager() {
  // Bower
  var bower = this.src.readJSON("bower.json");

  // If handlebars was specified ensure Handlebars is required.
  if (this.config.get("templateEngine") === "handlebars") {
    bower.dependencies.handlebars = "~1.0.0";
  }

  this.dest.write("bower.json", this.normalizeJSON(bower));

  var bowerrc = this.src.readJSON(".bowerrc");
  bowerrc.directory = path.join(this.config.get("paths").base, bowerrc.directory).replace(/(\\)/g, "/");
  this.dest.write(".bowerrc", this.normalizeJSON(bowerrc));
};

/**
 * Generate the Gruntfile
 */

Generator.prototype.genGruntfile = function genGruntfile() {
  var tree = new Tree( this.src.read("Gruntfile.js") );

  // Update to use the choosed test FW
  tree.object().passedTo("grunt.initConfig").key("karma").key("options")
      .key("frameworks").value("[\""+ this.config.get("testFramework") +"\"]");

  this.dest.write("Gruntfile.js", this.normalizeJS(tree.toString()));

};

/**
 * Scaffold the test directory
 */

Generator.prototype.testScaffolding = function testScaffolding() {
  var root = "test/" + this.config.get("testFramework");
  this.src.recurse(root, function( abspath, rootdir, subdir, filename ) {
    var code = grunt.file.read(abspath);
    var dest = path.join(this.config.get("paths").base, root, filename);

    if (abspath.slice(-3) === ".js") {
      code = this.normalizeJS(code);
    }

    if (abspath.slice(-5) === ".html") {
      code = this.normalizeHTML(code);
    }

    if (subdir != null) {
      dest = path.join(this.config.get("paths").base, root, subdir, filename);
    }

    this.dest.write(dest, code);
  }.bind(this));

  var runner = this.src.read("test/runner.js");
  this.dest.write("test/runner.js", this.normalizeJS(runner));
};

/**
 * Generate git related files
 */

Generator.prototype.generateGit = function generateGit() {
  // NPM use .gitignore as .npmignore
  this.dest.write(".gitignore", this.src.read(".npmignore"));
};

/**
 * Generate Travis CI related files
 */

Generator.prototype.generateGit = function generateGit() {
  this.dest.write(".travis.yml", this.src.read(".travis.yml"));
};

/**
 * Generate .editorconfig file
 */

Generator.prototype.generateEditorConfig = function generateEditorConfig() {
  var filepath = path.join(__dirname, "../../templates/editorconfig");
  var tpl = _.template(this.src.read(filepath));
  this.dest.write(".editorconfig", tpl(this.config.get("indent")));
};

/**
 * Generate the `package.json` file
 */

Generator.prototype.genPackageJSON = function genPackageJSON() {
  // Set package settings
  this.pkg.name = this._.slugify(this.pkg.name);
  this.pkg.version = "0.1.0";

  this.dest.write("package.json", this.normalizeJSON(this.pkg));
};
