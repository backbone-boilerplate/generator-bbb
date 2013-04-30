"use strict";
var util = require("util");
var path = require("path");
var yeoman = require("yeoman-generator");


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
    name: "projectName",
    message: "Your project name:",
    default: "name-me-later"
  }, {
    name: "testFramework",
    message: "Which test framwork do you want to use?" +
      "\n 1) QUnit" +
      "\n 2) Mocha" +
      "\n 3) Jasmine" +
      "\n Default: ",
    default: "1"
  }];

  var testFrameworks = {
    1: "qunit",
    2: "mocha",
    3: "jasmine"
  };

  this.prompt(prompts, function (err, props) {
    if (err) {
      return this.emit("error", err);
    }

    this.projectName = props.projectName;
    this.testFramework = testFrameworks[props.testFramework];

    done();
  }.bind(this));
};

bbbGenerator.prototype.app = function app() {
  this.directory("app", "app", true);
  this.mkdir("vendor");
  this.mkdir("app/modules");
  this.mkdir("app/templates");
  this.mkdir("app/styles");
  this.mkdir("app/img");

  this.copy("_package.json", "package.json");
  this.copy("_component.json", "component.json");
  this.copy("_bowerrc", ".bowerrc");
  this.copy("index.html", "index.html");
  this.copy("favicon.ico", "favicon.ico");
  this.copy("Gruntfile.js", "Gruntfile.js");
};

bbbGenerator.prototype.testScaffholding = function testScaffholding() {
  this.directory("test/" + this.testFramework, "test", true);
};

bbbGenerator.prototype.saveConfig = function saveConfig() {
  this.write(".bbbrc", JSON.stringify({
    projectName   : this.projectName,
    testFramework : this.testFramework
  }, null, "  "));
};
