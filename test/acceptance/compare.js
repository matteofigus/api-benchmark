'use strict';

var apiBenchmark = require('./../../index');
var should = require('should');
var TestServers = require('http-test-servers');

describe('compare function', function(){

  var testServers,
      servers = { 'Slow server': { port: 3006, delay: 20 },
                  'Fast server': { port: 3007, delay: 0 }};

  var serversToBenchmark = { 'Slow server': 'http://localhost:3006/',
                             'Fast server': 'http://localhost:3007/'};

  var endpoints = {
        simpleRoute: '/getJson',
        secondaryRoute: '/getJson2',
        postRoute: {
          route: '/postJson',
          method: 'post',
          data: {
            test: true,
            someData: 'someStrings'
          }
        },
        deleteRoute: {
          route: '/deleteMe?test=true',
          method: 'delete'
        }
      };

  before(function(done){

    var serversToStart = new TestServers(endpoints, servers);
    serversToStart.start(function(httpTestServers){
      testServers = httpTestServers;
      done();
    });
  });

  after(function(done){
    testServers.kill(done);
  });

  it('should correctly recognize the fastest service', function(done) {
    apiBenchmark.compare(serversToBenchmark, { simpleRoute: endpoints.simpleRoute }, function(err, results){
      results['Fast server'].isFastest.should.be.eql(true);
      done();
    });
  });

  it('should correctly compare multiple routes', function(done) {
    apiBenchmark.compare(serversToBenchmark, { simpleRoute: endpoints.simpleRoute, secondaryRoute: endpoints.secondaryRoute }, { minSamples: 5 }, function(err, results){
      results['Fast server'].isFastest.should.be.eql(true);
      done();
    });
  });
});
