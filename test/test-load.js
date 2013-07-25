/*global describe, beforeEach, it*/
"use strict";

var assert  = require("assert");

describe("bbb generator", function () {
  it("can be imported without blowing up", function () {
    var app = require("../lib/generators/app");
    assert(app !== undefined);
  });
});
