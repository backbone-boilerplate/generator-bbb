function(path) {
  var JST = window.JST;
  var Handlebars = require("handlebars");

  // Concatenate the file extension.
  path = path + ".hbs";

  // If cached, use the compiled template.
  if (JST && JST[path]) {
    // If the template hasn't been compiled yet, then compile.
    if (!JST[path].__compiled__) {
      JST[path] = Handlebars.template(JST[path]);
      JST[path].__compiled__ = true;
    }

    return JST[path];
  }

  // Put fetch into `async-mode`.
  var done = this.async();

  // Seek out the template asynchronously.
  $.get(app.root + path, function(contents) {
    done(Handlebars.compile(contents));
  }, "text");
}
