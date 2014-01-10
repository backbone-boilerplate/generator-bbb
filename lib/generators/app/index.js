/**
 * BBB `app` generator for Yeoman
 * Scaffold the project structure
 */

"use strict";
var util = require("util");
var path = require("path");
var _ = require("lodash");
var Tree = require("ast-query");
var InitGenerator = require("../init/index");


/**
 * BBB Generator constructor
 * Extend the bbb:init generator
 * Launch packages manager once the installation ends
 */

var Generator = InitGenerator.extend({
  constructor: function (args, options, config) {
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
  },

  /**
   * Command prompt questions
   * Note: Directly extend these functions on the generator prototype as Yeoman run every
   * direct prototype attached method (e.g.: `.hasOwnProperty()`)
   */

  askFor: InitGenerator.prototype.askFor,

  /**
   * Copy boilerplate main code
   * all `app/` folder, index.html and favicon
   */

  app: function app() {
    this.dest.mkdir(path.join(this.config.get("paths").base, "vendor"));

    this.src.recurse("app", function( abspath, rootdir, subdir, filename ) {
      var dest = path.join(this.config.get("paths").base, "app", filename);

      // Manage app.js elsewhere
      if (filename === "app.js") {
        return;
      }

      if (subdir != null) {
        dest = path.join(this.config.get("paths").base, "app", subdir, filename);
      }

      this.src.copy(abspath, dest);
    }.bind(this));

    this.dest.write("README.md", "");
    this.src.copy("index.html", path.join(this.config.get("paths").base, "index.html"));
  },

  /**
   * Generate the `app/app.js` file
   * Manage Templating engine
   */

  genAppJs: function genAppJs() {
    var self = this;
    var appFile = this.src.read("app/app.js");

    this.dest.write(path.join(this.config.get("paths").base, "app/app.js"), appFile);
  },

  /**
   * Generate the Packages Managers configurations
   */

  genPackageManager: function genPackageManager() {
    // Bower
    var bower = this.src.readJSON("bower.json");

    // If handlebars was specified ensure Handlebars is required.
    if (this.config.get("templateEngine") === "handlebars") {
      bower.dependencies.handlebars = "~1.0.0";
    }

    bower.name = this._.slugify(this.pkg.name);
    bower.version = "0.1.0";

    this.dest.write("bower.json", this.normalizeJSON(bower));

    var bowerrc = this.src.readJSON(".bowerrc");
    bowerrc.directory = path.join(this.config.get("paths").base, bowerrc.directory).replace(/(\\)/g, "/");
    this.dest.write(".bowerrc", this.normalizeJSON(bowerrc));
  },

  /**
   * Generate the Gruntfile
   */

  genGruntfile: function genGruntfile() {
    var tree = new Tree( this.src.read("Gruntfile.js") );

    // Update to use the choosed test FW
    tree.object().passedTo("grunt.initConfig").key("karma").key("options")
        .key("frameworks").value("[\""+ this.config.get("testFramework") +"\"]");

    this.dest.write("Gruntfile.js", tree.toString());
  },

  /**
   * Scaffold the test directory
   */

  testScaffolding: function testScaffolding() {
    var root = "test/" + this.config.get("testFramework");

    this.src.recurse(root, function( abspath, rootdir, subdir, filename ) {
      var dest = path.join(this.config.get("paths").base, root, filename);

      if (subdir != null) {
        dest = path.join(this.config.get("paths").base, root, subdir, filename);
      }

      this.src.copy(abspath, dest);
    }.bind(this));

    this.src.copy("test/runner.js", path.join(this.config.get("paths").base, "test/runner.js"));
  },

  /**
   * Generate git related files
   */

  generateGit: function generateGit() {
    // NPM use .gitignore as .npmignore
    this.dest.write(".gitignore", this.src.read(".npmignore"));
  },

  /**
   * Generate Travis CI related files
   */

  generateTravis: function generateTravis() {
    this.dest.write(".travis.yml", this.src.read(".travis.yml"));
  },

  /**
   * Generate .editorconfig file
   */

  generateEditorConfig: function generateEditorConfig() {
    var filepath = path.join(__dirname, "../../templates/editorconfig");
    var tpl = _.template(this.src.read(filepath));
    this.dest.write(".editorconfig", tpl(this.config.get("indent")));
  },

  /**
   * Generate the `package.json` file
   */

  genPackageJSON: function genPackageJSON() {
    // Set package settings
    this.pkg.name = this._.slugify(this.pkg.name);
    this.pkg.version = "0.1.0";

    this.dest.write("package.json", JSON.stringify(this.pkg));
  }

});

module.exports = Generator;
Generator._name = "bbb:app";
