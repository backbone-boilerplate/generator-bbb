var path = require("path");
var fs = require("fs");
var helpers = require("yeoman-generator").test;
var assert = require("yeoman-generator").assert;
var detectIndent = require("detect-indent");

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

    it("indent files with 2 spaces", function () {
      var file = fs.readFileSync("app/app.js", "utf8");
      assert.equal(detectIndent(file), "  ");
    });
  });

  describe("specifying project name", function () {
    before(function (done) {
      helpers.testDirectory(path.join(__dirname, "temp"), function() {
        this.app = helpers.createGenerator("bbb:app", [
          path.join(__dirname, "../lib/generators/app")
        ]);
        this.app.options["skip-install"] = true;
        helpers.mockPrompt(this.app, { name: "bbb-project" });
        this.app.run({}, function () { done(); });
      }.bind(this));
    });

    it('fill in package.json', function () {
      var pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
      assert.equal(pkg.name, "bbb-project");
    });

    it('fill in bower.json', function () {
      var pkg = JSON.parse(fs.readFileSync("bower.json", "utf8"));
      assert.equal(pkg.name, "bbb-project");
    });
  });

  describe("specifying a folder on the CLI", function () {
    before(function (done) {
      helpers.testDirectory(path.join(__dirname, "temp"), function() {
        this.app = helpers.createGenerator("bbb:app", [
          path.join(__dirname, "../lib/generators/app")
        ], [ "subpath/" ]);
        this.app.options["skip-install"] = true;
        helpers.mockPrompt(this.app, { name: "bbb-project" });
        this.app.run({}, function () { done(); });
      }.bind(this));
    });

    it("scaffold project in the folder", function () {
      assert.equal(path.basename(process.cwd()), "subpath");
      assert.file(defaultFiles);
    });
  });
});
