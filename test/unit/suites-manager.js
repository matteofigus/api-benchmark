'use strict';

var DebugHelper = require('./../../lib/debug-helper');
var SuitesManager = require('./../../lib/suites-manager');
var should = require('should');
var testAgent = require('./../fixtures/test-agent');
var testData = require('./../fixtures/test-data');
var _ = require('underscore');

var fakeAgent = new testAgent.FakeAgent(),
    debugHelper = new DebugHelper();

describe('SuitesManager.addEndpoints function', function(){

  it('should correctly handle headers for specific endpoints', function(done) {

    var suites = new SuitesManager(fakeAgent, debugHelper);

    suites.addEndpoints({ routeName: { route: '/route', method: 'get', headers: { 'name': 'value' } }});

    _.find(suites.routes, function(route){
      return route.name === 'routeName';
    }).endpoint.headers.should.be.eql({ name: 'value'});

    done();
  });
});

describe('SuitesManager.logFinalComparisonResult function', function(){

  var FakeLogger = function(){

    this.logStack = [];

    var self = this;

    this.simpleLog = function(message){
      self.log(message);
    };

    this.log = function(message){
      self.logStack.push(message);
    };

  };

  it('should correctly log the faster in case of comparison', function(done) {

    var results = {
      'Slow server': {
        simpleRoute: {
          name: 'Slow server/simpleRoute',
          stats: [],
          hz: 4.831093764217758,
          href: 'http://localhost:3006/getJson'
        },
        isSlowest: true
      },
      'Fast server': {
        simpleRoute: {
          name: 'Fast server/simpleRoute',
          stats: [],
          hz: 217.14933595635625,
          href: 'http://localhost:3007/getJson'
        },
        isFastest: true
      }
    };

    var fakeLogger = new FakeLogger(),
        suites = new SuitesManager(fakeAgent, fakeLogger);

    suites.logFinalComparisonResult(results);

    fakeLogger.logStack[0].should.be.eql('Fastest Service is Fast server');
    done();
  });

  it('should not log anything in case of a single service', function(done) {

    var results = {
      'Slow server': {
        simpleRoute: {
          name: 'Slow server/simpleRoute',
          stats: [],
          hz: 4.831093764217758,
          href: 'http://localhost:3006/getJson'
        },
        isFastest: true
      }
    };

    var fakeLogger = new FakeLogger(),
        suites = new SuitesManager(fakeAgent, fakeLogger);

    suites.logFinalComparisonResult(results);

    fakeLogger.logStack.length.should.be.eql(0);
    done();
  });

});
