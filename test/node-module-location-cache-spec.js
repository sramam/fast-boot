"use strict";
var chai = require('chai');
var expect = chai.expect;
var fs = require('fs');
var childProcess = require('child_process');
var nodeModuleCache = require("../");
var util = require('util');

describe("fast-boot", function () {

  beforeEach(function () {
    try {
    fs.unlinkSync(nodeModuleCache.DEFAULT_CACHE_FILE);
    }
    catch (e) {}
  });

  it("should not prevent loading NPM modules", function(done) {
    var child = childProcess.fork("./test/test-app.js", ["1.0.0"]);
    child.on("message", function(data) {
      console.log(util.format("first run  [%s]: %s Sec, statSync: %d, readFileSync: %d, existsSyncCount: %d", "1.0.0", hrTimeToSecString(data.loadingTime), data.statSyncCount, data.readFileSyncCount, data.existsSyncCount));
      expect(data.statSyncCount).to.be.above(100);
      expect(data.readFileSyncCount).to.be.above(100);

      var moduleLocationsCache = loadModuleLocationsCache();
      expect(moduleLocationsCache).to.satisfy(noNonNodeModulesPaths);
      done();
    })
  });

  it("should not search for files again on second invocation of node", function(done) {
    var child = childProcess.fork("./test/test-app.js", ["1.0.0"]);
    child.on("message", function(data) {
      console.log(util.format("first run  [%s]: %s Sec, statSync: %d, readFileSync: %d, existsSyncCount: %d", "1.0.0", hrTimeToSecString(data.loadingTime), data.statSyncCount, data.readFileSyncCount, data.existsSyncCount));

      var child2 = childProcess.fork("./test/test-app.js", ["1.0.0"]);
      child2.on("message", function(data2) {
        expect(data.statSyncCount).to.be.above(data2.statSyncCount);
        expect(data.readFileSyncCount).to.be.above(data2.readFileSyncCount);
        console.log(util.format("second run [%s]: %s Sec, statSync: %d, readFileSync: %d, existsSyncCount: %d", "1.0.0", hrTimeToSecString(data2.loadingTime), data2.statSyncCount, data2.readFileSyncCount, data2.existsSyncCount));

        var moduleLocationsCache = loadModuleLocationsCache();
        expect(moduleLocationsCache).to.satisfy(noNonNodeModulesPaths);
        done();
      })
    })
  });

  it("should not cache if using a different cache killer (the version parameter)", function(done) {
    var child = childProcess.fork("./test/test-app.js", ["1.0.0"]);
    child.on("message", function(data) {
      console.log(util.format("first run  [%s]: %s Sec, statSync: %d, readFileSync: %d, existsSyncCount: %d", "1.0.0", hrTimeToSecString(data.loadingTime), data.statSyncCount, data.readFileSyncCount, data.existsSyncCount));

      var child2 = childProcess.fork("./test/test-app.js", ["1.0.1"]);
      child2.on("message", function(data2) {
        console.log(util.format("second run [%s]: %s Sec, statSync: %d, readFileSync: %d, existsSyncCount: %d", "1.0.1", hrTimeToSecString(data2.loadingTime), data2.statSyncCount, data2.readFileSyncCount, data2.existsSyncCount));
        expect(data.statSyncCount).to.be.equal(data2.statSyncCount);
        expect(data.readFileSyncCount).to.be.equal(data2.readFileSyncCount);

        var moduleLocationsCache = loadModuleLocationsCache();
        expect(moduleLocationsCache).to.satisfy(noNonNodeModulesPaths);
        done();
      })
    })
  });

});

function loadModuleLocationsCache() {
  var content = fs.readFileSync(nodeModuleCache.DEFAULT_CACHE_FILE);
  return JSON.parse(content);
}

function noNonNodeModulesPaths(moduleLocationsCache) {
  var keys = Object.keys(moduleLocationsCache);
  for (var index in keys) {
    var key = keys[index];
    if (key != "_cacheKiller")
    if (moduleLocationsCache[key] && moduleLocationsCache[key].indexOf("node_modules") == -1)
      return false;
  }
  return true;
}

function hrTimeToSecString(hrTime) {
  return hrTime[0] + "." + String('000000000'+hrTime[1]).slice(-9)
}