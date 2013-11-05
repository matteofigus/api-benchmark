var DebugHelper = require('./../../lib/debug-helper');
var SuitesManager = require('./../../lib/suites-manager');
var should = require('should');
var testAgent = require('./../fixtures/test-agent');
var testData = require('./../fixtures/test-data');
var _ = require('underscore');

var fakeAgent = new testAgent.FakeAgent(),
    debugHelper = new DebugHelper();

describe('addEndpoints function', function(){

  it('should correctly raise exception if endpoints is null', function(done) {

    var suites = new SuitesManager(testData.getFakeBenchmarkObject(), fakeAgent, debugHelper);

    (function(){
      suites.addEndpoints(null);
    }).should.throw("Endpoints argument is not valid");

    done();
  });

  it('should correctly raise exception if endpoints is not an object', function(done) {

    var suites = new SuitesManager(testData.getFakeBenchmarkObject(), fakeAgent, debugHelper);

    (function(){
      suites.addEndpoints([]);
    }).should.throw("Endpoints argument is not valid");

    done();
  });

  it('should correctly raise exception if endpoints is an empty object', function(done) {

    var suites = new SuitesManager(testData.getFakeBenchmarkObject(), fakeAgent, debugHelper);

    (function(){
      suites.addEndpoints({});
    }).should.throw("Endpoints argument is not valid");

    done();
  });

  it('should correctly raise exception if an endpoint contains an unsupported method', function(done) {

    var suites = new SuitesManager(testData.getFakeBenchmarkObject(), fakeAgent, debugHelper);

    (function(){
      suites.addEndpoints({ routeName: { route: '/route', method: 'unsupported' }});
    }).should.throw("Endpoints argument is not valid - found an unsupported http verb");

    done();
  });

  it('should correctly handle headers for specific endpoints', function(done) {

    var suites = new SuitesManager(testData.getFakeBenchmarkObject(), fakeAgent, debugHelper);

    suites.addEndpoints({ routeName: { route: '/route', method: 'get', headers: { 'name': 'value' } }});

    _.find(suites.suites, function(suite){ 
      return suite.name == 'routeName'
    }).endpoint.headers.should.be.eql({ name: 'value'});
    
    done();
  });
});

describe('addServices function', function(){

  it('should correctly raise exception if services is null', function(done) {

    var suites = new SuitesManager(testData.getFakeBenchmarkObject(), fakeAgent, debugHelper);

    (function(){
      suites.addServices(null);
    }).should.throw("Services argument is not valid");

    done();
  });

  it('should correctly raise exception if services is not an object', function(done) {

    var suites = new SuitesManager(testData.getFakeBenchmarkObject(), fakeAgent, debugHelper);

    (function(){
      suites.addServices([]);
    }).should.throw("Services argument is not valid");

    done();
  });

  it('should correctly raise exception if services is an empty object', function(done) {

    var suites = new SuitesManager(testData.getFakeBenchmarkObject(), fakeAgent, debugHelper);

    (function(){
      suites.addServices([]);
    }).should.throw("Services argument is not valid");

    done();
  });
});

describe('onBenchResults function', function(){

  it('should correctly raise exception if the callback is null', function(done) {

    var suites = new SuitesManager(testData.getFakeBenchmarkObject(), fakeAgent, debugHelper);

    (function(){
      suites.onBenchResults(null);
    }).should.throw("Callback argument is not valid");

    done();
  });

  it('should correctly raise exception if the callback is not a function', function(done) {

    var suites = new SuitesManager(testData.getFakeBenchmarkObject(), fakeAgent, debugHelper);

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