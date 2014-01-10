var path    = require("path");
var helpers = require("yeoman-generator").test;
var assert = require("yeoman-generator").assert;

var defaultFiles = [
  ".bowerrc",
  ".gitignore",
  ".yo-rc.json",
  "bower.json",
  "Gruntfile.js",
  "index.html",
  "package.json",
  "README.md",
  "app/app.js",
  "app/config.js",
  "app/main.js",
  "app/router.js",
  "test/runner.js"
];

describe("bbb generator", function () {
  describe("with defaults settings", function () {
    before(function (done) {
      helpers.testDirectory(path.join(__dirname, "temp"), function() {
        this.app = helpers.createGenerator("bbb:app", [
          path.join(__dirname, "../lib/generators/app")
        ]);
        this.app.options["skip-install"] = true;
        helpers.mockPrompt(this.app);
        this.app.run({}, function () { done(); });
      }.bind(this));
    });

    it("create expected files", function () {
      assert.file(defaultFiles.concat([
        "test/qunit/specs/example.spec.js",
        "test/qunit/specs/boilerplate/router.spec.js"
      ]));
    });
  });
});
