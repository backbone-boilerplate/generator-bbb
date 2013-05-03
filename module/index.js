"use strict";
var util = require("util");
var path = require("path");
var yeoman = require("yeoman-generator");
var _ = require("lodash");

var bbbGenerator = module.exports = function bbbGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  this.moduleName = args[0];
  this.settings = JSON.parse(this.read(path.join(process.cwd(), ".bbbrc")));
};

util.inherits(bbbGenerator, yeoman.generators.NamedBase);

bbbGenerator.prototype.module = function module() {

  if (!this.settings) {
    this.log.status("conflict").write("You must init your project first");
    return;
  }
  if (!this.moduleName) {
    this.log.writeln(">> You must provide a name for your module");
    return;
  }

  this.copy("module.js", "app/modules/" + this.moduleName + ".js");
};

bbbGenerator.prototype.moduleTest = function moduleTest() {
  // TODO: Generate module test scaffhold
};
