'use strict';

var DebugHelper = require('./../../lib/debug-helper');
var should = require('should');

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
        debugHelper = new DebugHelper(fakeLogger);

    debugHelper.simpleLog('Message');

    fakeLogger.logStack[0].should.be.eql('Message');
    done();
  });

  it('should correctly log messages', function(done) {

    var fakeLogger = new FakeLogger(),
        debugHelper = new DebugHelper(fakeLogger);

    debugHelper.log('Message');

    fakeLogger.logStack[0].should.be.eql('======================================');
    fakeLogger.logStack[1].should.be.eql('Message');
    fakeLogger.logStack[2].should.be.eql('');

    done();
  });

  it('should correctly log comparison result in case of comparison', function(done) {

    var fakeLogger = new FakeLogger(),
        debugHelper = new DebugHelper(fakeLogger);

    debugHelper.log('Message');

    fakeLogger.logStack[0].should.be.eql('======================================');
    fakeLogger.logStack[1].should.be.eql('Message');
    fakeLogger.logStack[2].should.be.eql('');

    done();
  });

  it('should correctly log nothing if it is not enabled', function(done) {

    var fakeLogger = new FakeLogger(),
        debugHelper = new DebugHelper(fakeLogger);

    debugHelper.shutUp();

    debugHelper.simpleLog('Message');
    debugHelper.log('Message');

    fakeLogger.logStack.length.should.be.eql(0);
    done();
  });
});
