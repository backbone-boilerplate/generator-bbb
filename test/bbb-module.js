var path = require("path");
var fs = require("fs");
var helpers = require("yeoman-generator").test;
var assert = require("yeoman-generator").assert;
var detectIndent = require("detect-indent");

describe("bbb:module", function () {
  before(function (done) {
    helpers.testDirectory(path.join(__dirname, "temp"), function() {
      this.app = helpers.createGenerator("bbb:app", [
        path.join(__dirname, "../lib/generators/app")
      ]);
      this.app.options["skip-install"] = true;
      helpers.mockPrompt(this.app);
      this.app.run({}, function () {
        this.module = helpers.createGenerator("bbb:module", [
          path.join(__dirname, "../lib/generators/module")
        ], [ "lab" ]);
        this.module.run({}, function () { done(); });
      }.bind(this));
    }.bind(this));
  });

  it("generate module file", function () {
    assert.file("app/modules/lab.js");
  });

  it("generate module spec", function () {
    assert.fileContent("test/qunit/specs/lab.spec.js", /require\(\"modules\/lab\"\)/);
  });
});
