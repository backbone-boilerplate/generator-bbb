define(function(require, exports, module) {

  var Module = require("<%= modulePath %>");

  // Test that the module exists.
  describe("<%= moduleName %>", function() {
    it("exists", function() {
      expect(Module).toBeTruthy();
    });
  });

});
