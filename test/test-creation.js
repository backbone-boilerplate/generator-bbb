/*global describe, beforeEach, it*/
"use strict";

var path    = require("path");
var helpers = require("yeoman-generator").test;


describe("bbb generator", function () {
  beforeEach(function (done) {
    helpers.testDirectory(path.join(__dirname, "temp"), function (err) {
      if (err) {
        return done(err);
      }

      this.app = helpers.createGenerator("bbb:app", [
        "../../lib/generators/app"
      ]);
      this.app.options["skip-install"] = true;
      done();
    }.bind(this));
  });

  it("creates expected files", function (done) {
    var expected = [
      // add files you expect to exist here.
      ".bowerrc",
      "bower.json",
      "Gruntfile.js",
      "index.html",
      "app/config.js",
      "app/app.js",
      "app/main.js",
      ".gitignore",
      ".travis.yml",
      ".editorconfig",
      "package.json"
    ];

    helpers.mockPrompt(this.app);

    this.app.run({}, function () {
      helpers.assertFiles(expected);
      done();
    });
  });

});
