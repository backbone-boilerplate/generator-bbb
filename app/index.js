"use strict";
var util = require("util");
var path = require("path");
var yeoman = require("yeoman-generator");
var falafel = require("falafel");
var _ = require("lodash");

// TODO: Get this native in Yeoman
var spawn = require('child_process').spawn;
var win32 = process.platform === 'win32';

function spawnCommand(command, args, cb) {
  var winCommand = win32 ? 'cmd' : command;
  var winArgs = win32 ? ['/c ' + command + ' ' + args.join(' ')] : args;

  return spawn(winCommand, winArgs, { stdio: 'inherit' });
}


var bbbGenerator = module.exports = function bbbGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  this.on("end", function () {
    this.installDependencies({ skipInstall: options["skip-install"] });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, "../package.json")));
};

util.inherits(bbbGenerator, yeoman.generators.NamedBase);

bbbGenerator.prototype.askFor = function askFor() {
  var done = this.async();

  console.log("" +
"\n                                ;HH;                                                                        " +
"\n                             ,;s@@@@r:.                                                                     " +
"\n                       ,2@@@@@@@@@@@@@@@@@A;                                                                " +
"\n                    ,B@@@@@@@@@@@@@@@@@@@@@@@#:                                                             " +
"\n                  :@@@@@@@@@@@@@@@@@@@@@@@@@@@@@:                                                           " +
"\n                 M@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@B                                                          " +
"\n                @@@@@@@@@@@@@@@@@BAGGhG&AB@@@@@@@@@                                                         " +
"\n               @@@@@@@@@@@@@@@MG99hGGGGGh93&#@@@@@@@                                                        " +
"\n              X@@@@@@@@@@@@@@AXh&AAAAAAAA&G9XA@@@@@@@                                                       " +
"\n              @@@@@@@@@@@@@@@Gh&AAAAAAAAAAAAA#@@@@@@@;                                                      " +
"\n             r@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@                                                      " +
"\n             X@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#####@@@@hir;#@;                                               " +
"\n         ,r23@@@@@@@@@@#BAA&&&G&&&GGGGhhhhG&G&&AAHB#@@@@@@@@@@X                                             " +
"\n     i@@@@@@@@@@@@@@@@@@@@@@@@Mh&G&&&&&&&&@@@@@@@@@@@@@@@@@@@@@.                                            " +
"\n    :@@@@@@@@@@@@@@@@@@@@@@@@@#hH@@BAAAAAA@@@@@@@@@@@@@@@@Hs,                                               " +
"\n       ;Sh@@@@@@@@@@@@@@@@@@,  ::.s@@HHHAA@@@9.;2i;i@i  A#                                                  " +
"\n           @s    #@@@@@@@@&  &@9,   @#HHA&@@, A@;    @rh@.                                                  " +
"\n           H@s   #@@@@@@@@  @@2     ,@HHA&@A A@G     :@@@i                                                  " +
"\n           @@@;  @@@@@@@@@  @@#     ,@HHA&@M :@@; ., .@@B                                                   " +
"\n           ;@@@  @@@@@@@@@#  &@@@X  @@HHAA@@;  H@@#  @@@                                                    " +
"\n            @@@  @@@@@@@@@@@,    .5@@HHHHH@@@#.  ..X@@@                                                     " +
"\n            ;@@B #@@@@@@@@@@@@@@@@@#HB#@#M@@@@@@@S@@@@                                                      " +
"\n             @@@ H@@@@@@@@@@@@@@@#AA##s      ;#@@ @@@;                                                      " +
"\n:,.          .#@ &@@@@@@@@@@@@@M9H#@S           #@@:                                                        " +
"\nSGBHAG35sr:.   @i@@@@@@@@@@@@@@@@@@;  #@@@@A     &@                                                         " +
"\niSX9hG&AHHHAh2;#@@@@@@@@@@@@@@@@@@A :@@@@@@@@,    @r                                                        " +
"\nisS55552222225si@@@@@@@@@@@@@@@@@@; @@@@@@@@@@    @A                                                        " +
"\nisiiiiiiiSSSSis;#@@@@@@@@@@@@@@@@@G i@@@@@@@@s    @;                                                        " +
"\nisiiiiiiiiiiiis;r@@@@@@@@@@@@@@@@@@  ;@@@@@@;    r@                                                         " +
"\nisiiiiiiiiiiiisr;@@@@@@@@@@@@@@@@@@@.           S@hX&G32ir;:.                                               " +
"\nisiiiiiiiiiiiiir;@@@@@@@@@@@@@@@@@@@@#.      .2@@ssX3G&AHHBBBHAGX5sr;,.                                     " +
"\nisiiiiiiiiiiiiisr@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#;iS5552222XX3hG&AHHBBHA&hXSs;:,.                           " +
"\nisiiiiiiiiiiiiis;@@@@@@@@@@@@@@AhHM#@@@@@@@@@@@@#;siiiiiiiSSSSS555222XX3hGAAHHBBHAG35ir;,.                  " +
"\ns;rrrrrrrrrrrrr;:@@@@@@@@@@@@@@A2XX39GAAHA@@@@@@B:;rrrrrrrrrrrrrrrrrrrrrsssssiiiS52X39hhGh9X2ir;:,.         " +
"\nGGAAAAAAAAAAAAAG3@@@@@@@@@@@@@@#HBBBHG&A&GB#@@@@@9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHHHHBBMMM##@@@@@@@@@@@#B&X5r" +
"\n@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@BBBBBBH@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"
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

  this.prompt(prompts, function (err, props) {
    if (err) {
      return this.emit("error", err);
    }

    this.appname = props.appname;
    this.testFramework = testFrameworks[props.testFramework];
    this.packageManager = packageManagers[props.packageManager];

    done();
  }.bind(this));

  // After scaffholing hook
  this.on("end", function () {
    if (this.packageManager === "jam") {
      spawnCommand("jam", ["upgrade"]);
    }
  });
};

bbbGenerator.prototype.app = function app() {
  this.directory("app", "app", true);
  this.mkdir("vendor");
  this.mkdir("app/modules");
  this.mkdir("app/templates");
  this.mkdir("app/styles");
  this.mkdir("app/img");

  this.copy("index.html", "index.html");
  this.copy("favicon.ico", "favicon.ico");
};

bbbGenerator.prototype.genPackageManager = function genPackageManager() {
  // Bower
  if (this.packageManager === "bower") {
    this.copy("_component.json", "component.json");
    this.copy("_bowerrc", ".bowerrc");
  }
};

bbbGenerator.prototype.genGruntfile = function genGruntfile() {
  var self = this;

  // function parseKarmaConfig( conf ) {
  //   var source = eval(conf.source().replace(/^karma\:\s/i, ""));

  //   if( self.testFramework !== "mocha" ) {
  //     delete source.mocha;
  //   }

  //   conf.update("karma: " + JSON.stringify(source, null, "  "));
  // }

  // var output = falafel(this.read("Gruntfile.js"), function(node) {
  //   if (node.type === "CallExpression" &&
  //       node.callee.object.name === "grunt" &&
  //       node.callee.property.name === "initConfig") {
  //     var gruntConfig = node.arguments[0];

  //     var karmaConf = _.filter(gruntConfig.properties, function(n) {
  //       return n.key.name === "karma";
  //     })[0];

  //     parseKarmaConfig(karmaConf);
  //   }
  // });

  // this.write("Gruntfile.js", output);

  this.copy("Gruntfile.js", "Gruntfile.js");

};

bbbGenerator.prototype.testScaffholding = function testScaffholding() {
  this.directory("test/" + this.testFramework, "test/" + this.testFramework, true);
};

bbbGenerator.prototype.saveConfig = function saveConfig() {
  this.write(".bbbrc", JSON.stringify({
    appname       : this.appname,
    testFramework : this.testFramework
  }, null, "  "));
};

bbbGenerator.prototype.genPackageJSON = function genPackageJSON() {
  var packageJSON = JSON.parse(this.read("_package.json"));

  // Delete Jam configuration if not used
  if (this.packageManager !== "jam") {
    delete packageJSON.jam;
  }

  // Set package settings
  packageJSON.name = this._.slugify(this.appname);

  this.write("package.json", JSON.stringify(packageJSON, null, "  "));
};
