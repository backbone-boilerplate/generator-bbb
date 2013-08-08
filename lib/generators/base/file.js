var path = require("path");
var _ = require("lodash");
var grunt = require("grunt");

/**
 * Return a file object
 * @param {String}  prefix       Path prefix
 * @param {Generator}  generator Parent Yeoman generator
 * @param {Boolean} isDest       Should write and copy check conflicts
 */
function File(prefix, generator, isDest) {
  prefix || (prefix = "./");

  _.assign(this, grunt.file, function(thisSrc, gruntFunc) {
    return function() {
      var src = arguments[0];
      var args = Array.prototype.slice.call(arguments, 1);

      if (!grunt.file.isPathAbsolute(src)) {
        src = path.join(prefix, src);
      }
      args.unshift(src);

      return gruntFunc.apply(grunt.file, args);
    }.bind(this);
  }, this);

  if (isDest) {
    // `write` and `copy` are specials as they should check for collision before
    this.write = _.bind(generator.write, generator);
    this.copy  = _.bind(generator.copy, generator);
  }
}

module.exports = File;
