var benchmarkjs = require('benchmark');
var DebugHelper = require('./../../lib/debug-helper');
var SuitesManager = require('./../../lib/suites-manager');
var should = require('should');
var testAgent = require('./../fixtures/test-agent');
var testData = require('./../fixtures/test-data');
var _ = require('underscore');

var FakeLogger = function(){

  this.logStack = [];

  var self = this;

  this.log = function(message){
    self.logStack.push(message);
  };

};

describe('log function', function(){

  it('should correctly log simple messages', function(done) {

    var fakeLogger = new FakeLogger(),
        debugHelper = new DebugHelper('test', fakeLogger);

    debugHelper.simpleLog("Message");

    fakeLogger.logStack[0].should.be.eql("Message");
    done();
  });

  it('should correctly log messages', function(done) {

    var fakeLogger = new FakeLogger(),
        debugHelper = new DebugHelper('test', fakeLogger);

    debugHelper.log("Message");

    fakeLogger.logStack[0].should.be.eql("======================================");
    fakeLogger.logStack[1].should.be.eql("Message");
    fakeLogger.logStack[2].should.be.eql("");

    done();
  });

  it('should correctly log comparison result in case of comparison', function(done) {

    var fakeLogger = new FakeLogger(),
        debugHelper = new DebugHelper('compare', fakeLogger);

    debugHelper.logComparisonResult("Message");

    fakeLogger.logStack[0].should.be.eql("======================================");
    fakeLogger.logStack[1].should.be.eql("Message");
    fakeLogger.logStack[2].should.be.eql("");

    done();
  });

  it('should correctly hide comparison result if it is not a comparison', function(done) {

    var fakeLogger = new FakeLogger(),
        debugHelper = new DebugHelper('measure', fakeLogger);

    debugHelper.logComparisonResult("Message");

    fakeLogger.logStack.length.should.be.eql(0);

    done();
  });

});