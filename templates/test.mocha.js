define(function(require, exports, module) {

var Backbone = require("backbone");
var Module = require("<%= modulePath %>");

// Specify the module we test
describe("<%= moduleName %>", function() {

  // Test that the Router exists.
  it("should exist", function() {
    expect(Module).to.exist;
  });

});

});
