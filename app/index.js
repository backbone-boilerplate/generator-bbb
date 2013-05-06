/**
 * BBB generator for Yeoman
 */

"use strict";
var util = require("util");
var path = require("path");
var yeoman = require("yeoman-generator");
var falafel = require("falafel");
var _ = require("lodash");
var grunt = require("grunt");


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
  yeoman.generators.Base.apply(this, arguments);

  this.destinationRoot(process.cwd());

  // Extend grunt.file to namespace with source and destination directory.
  // Note: I don't like Yeoman file API, so here I use a wrapped Grunt instead.

  this.src = {};
  this.dest = {};

  _.assign(this.src, grunt.file, function(thisSrc, gruntFunc) {
    return function() {
      var src = arguments[0];
      var args = Array.prototype.slice.call(arguments, 1);

      src = path.join(this.sourceRoot(), src);
      args.unshift(src);

      return gruntFunc.apply(grunt.file, args);
    }.bind(this);
  }, this);

  _.assign(this.dest, grunt.file, function(thisSrc, gruntFunc) {
    return function() {
      var src = arguments[0];
      var args = Array.prototype.slice.call(arguments, 1);

      src = path.join(this.destinationRoot(), src);
      args.unshift(src);

      return gruntFunc.apply(grunt.file, args);
    }.bind(this);
  }, this);

  // Attach helper functions
  this.helper = {};

  this.helper.normalizeJSON = function(obj) {
    if (!_.isObject(obj)) { throw new Error("normalizeJSON take an object"); }
    return JSON.stringify(obj, null, self.bbb.indent);
  };

  // Setup destination directory
  if (_.isString(args[0])) {
    if (grunt.file.isPathAbsolute(args[0])) {
      grunt.file.mkdir(args[0]);
      this.destinationRoot(args[0]);
    } else {
      this.dest.mkdir(args[0]);
      this.destinationRoot(path.join(process.cwd(), args[0]));
    }
    this.appname = _.last(args[0].split(/[\/\\]/g));
  }

  // Get existing configurations
  var packageJSON;
  try {
    packageJSON = this.dest.readJSON("package.json");
  } catch(e) { packageJSON = {}; }

  this.pkg = _.extend(this.src.readJSON("_package.json"), packageJSON);
  this.bbb = {};

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

util.inherits(Generator, yeoman.generators.Base);

/**
 * Command prompt questions
 * Extend defaults and options based on user answers
 */

Generator.prototype.askFor = function askFor() {
  var done = this.async();

  console.log(
    "\n    .-~0~-." +
    "\n   /   ___ \\ " +
    "\n   |  ( _ )|       ~~ Backbone-Boilerplate ~~" +
    "\n .-' (C) (C)`-  Welcome to the project generator" +
    "\n   |   .---.           Have a good time!" +
    "\n   |  / .-. \\ " +
    "\n   |  \\ `-' / " +
    "\n   |   `---'" +
    "\n __|_______|___ \n"
  );

  var prompts = [{
    name: "appname",
    message: "Your project name:",
    default: this.appname // Default to current folder name
  }, {
    name: "testFramework",
    message: "Which test framework do you want to use?" +
      "\n 1) QUnit" +
      "\n 2) Mocha" +
      "\n 3) Jasmine" +
      "\n Default: ",
    default: "1"
  }, {
    name: "packageManager",
    message: "Which package manager do you want to use?" +
      "\n 1) Jam" +
      "\n 2) Bower" +
      "\n 3) None" +
      "\n Default: ",
    default: "1"
  }, {
    name: "indent",
    message: "What about indentation?" +
      "\n 1) Spaces (2)" +
      "\n 2) Spaces (4)" +
      "\n 3) Tabs" +
      "\n Default: ",
    default: "1"
  }];

  var testFrameworks = {
    1: "qunit",
    2: "mocha",
    3: "jasmine"
  };

  var packageManagers = {
    1: "jam",
    2: "bower",
    3: "none"
  };

  var indents = {
    1: "  ",
    3: "    ",
    2: "\t"
  };

  this.prompt(prompts, function (err, props) {
    if (err) {
      return this.emit("error", err);
    }

    this.pkg.name = props.appname;
    this.bbb.testFramework = testFrameworks[props.testFramework];
    this.bbb.packageManager = packageManagers[props.packageManager];
    this.bbb.indent = indents[props.indent];

    done();
  }.bind(this));
};

/**
 * Copy boilerplate main code
 * all `app/` folder, index.html and favicon
 */

Generator.prototype.app = function app() {
  this.directory("app", "app", true);
  this.mkdir("vendor");
  this.mkdir("app/modules");
  this.mkdir("app/templates");
  this.mkdir("app/styles");
  this.mkdir("app/img");

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

  this.dest.write("Gruntfile.js", output);

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

/**
 * Save the current configuration inside `.bbbrc` files so sub-generator can use it too
 */

Generator.prototype.saveConfig = function saveConfig() {
  this.dest.write(".bbb-rc.json", this.helper.normalizeJSON(this.bbb));
};
