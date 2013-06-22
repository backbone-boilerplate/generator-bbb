define(function(require, exports, module) {

  var Module = require("<%= modulePath %>");

  // Specify top level modules so that they don't leak into other modules.
  QUnit.module("<%= moduleName %>");

  // Test that the module exists.
  test("<%= moduleName %>", 2, function() {
    ok(Module, "<%= moduleName %> constructor exists.");
  });

});
