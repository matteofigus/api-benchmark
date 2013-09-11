var SuitesManager = require('./../../lib/suites-manager');
var should = require('should');
var testData = require('./../fixtures/test-data');

describe('addEndpoints function', function(){

  it('should correctly raise exception if endpoints is null', function(done) {

    var suites = new SuitesManager(testData.getFakeBenchmarkObject());

    (function(){
      suites.addEndpoints(null);
    }).should.throw("Endpoints argument is not valid");

    done();
  });

  it('should correctly raise exception if endpoints is not an object', function(done) {

    var suites = new SuitesManager(testData.getFakeBenchmarkObject());

    (function(){
      suites.addEndpoints([]);
    }).should.throw("Endpoints argument is not valid");

    done();
  });

  it('should correctly raise exception if endpoints is an empty object', function(done) {

    var suites = new SuitesManager(testData.getFakeBenchmarkObject());

    (function(){
      suites.addEndpoints([]);
    }).should.throw("Endpoints argument is not valid");

    done();
  });
});

describe('addServices function', function(){

  it('should correctly raise exception if services is null', function(done) {

    var suites = new SuitesManager(testData.getFakeBenchmarkObject());

    (function(){
      suites.addServices(null);
    }).should.throw("Services argument is not valid");

    done();
  });

  it('should correctly raise exception if services is not an object', function(done) {

    var suites = new SuitesManager(testData.getFakeBenchmarkObject());

    (function(){
      suites.addServices([]);
    }).should.throw("Services argument is not valid");

    done();
  });

  it('should correctly raise exception if services is an empty object', function(done) {

    var suites = new SuitesManager(testData.getFakeBenchmarkObject());

    (function(){
      suites.addServices([]);
    }).should.throw("Services argument is not valid");

    done();
  });
});

describe('onBenchResults function', function(){

  it('should correctly raise exception if the callback is null', function(done) {

    var suites = new SuitesManager(testData.getFakeBenchmarkObject());

    (function(){
      suites.onBenchResults(null);
    }).should.throw("Callback argument is not valid");

    done();
  });

  it('should correctly raise exception if the callback is not a function', function(done) {

    var suites = new SuitesManager(testData.getFakeBenchmarkObject());

    (function(){
      suites.onBenchResults({});
    }).should.throw("Callback argument is not valid");

    (function(){
      suites.onBenchResults(null);
    }).should.throw("Callback argument is not valid");

    (function(){
      suites.onBenchResults([]);
    }).should.throw("Callback argument is not valid");

    done();
  });
});