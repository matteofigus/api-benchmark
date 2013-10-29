var apiBenchmark = require('./../../index');
var should = require('should');
var TestServers = require('http-test-servers');

describe('misure function', function(){

  var testServers,
      server = { "My api": { port: 3006, delay: 0 }},
      serversToBenchmark = { "My api": "http://localhost:3006"},
      endpoints = { 
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
    
    var serversToStart = new TestServers(endpoints, server);
    serversToStart.start(function(httpTestServers){
      testServers = httpTestServers;
      done();
    });
  });

  after(function(done){
    testServers.kill(done);
  });

  it('should correctly misure the performances of the service', function(done) {
    apiBenchmark.misure(serversToBenchmark, endpoints, { maxTime: 0.5 }, function(results){
      results['My api'].should.not.be.eql(null);
      done();
    });
  });

  it('should correctly display hrefs for each result', function(done) {
    apiBenchmark.misure(serversToBenchmark, { simpleRoute: endpoints.simpleRoute }, { maxTime: 0.5 }, function(results){
      results['My api'].simpleRoute.href.should.be.eql("http://localhost:3006/getJson");
      done();
    });
  });
});