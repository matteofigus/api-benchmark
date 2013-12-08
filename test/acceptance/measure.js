var apiBenchmark = require('./../../index');
var should = require('should');
var TestServers = require('http-test-servers');

describe('measure function', function(){

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
        },
        errorRoute: {
          route: '/errorRoute',
          method: 'get',
          statusCode: 403
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

  it('should correctly measure the performances of the service', function(done) {
    apiBenchmark.measure(serversToBenchmark, { simpleRoute: endpoints.simpleRoute, postRoute: endpoints.postRoute }, function(err, results){
      results['My api'].should.not.be.eql(null);
      done();
    });
  });

  it('should correctly perform the minimum number of samples if the optional parameter is specified', function(done) {
    apiBenchmark.measure(serversToBenchmark, { simpleRoute: endpoints.simpleRoute}, { minSamples: 10 }, function(err, results){
      results['My api'].simpleRoute.stats.sample.length.should.be.above(9);
      done();
    });
  });

  it('should correctly display hrefs for each result', function(done) {
    apiBenchmark.measure(serversToBenchmark, { simpleRoute: endpoints.simpleRoute }, function(err, results){
      results['My api'].simpleRoute.href.should.be.eql("http://localhost:3006/getJson");
      done();
    });
  });

  it('should correctly raise an exception if the optional StatusCode is specified and incorrect', function(done) {

    var routesToBenchmark = {
      simpleRoute: {
        route: "/getJson",
        expectedStatusCode: 200
      },
      errorRoute: {
        route: "/errorRoute",
        expectedStatusCode: 200
      }
    };

    apiBenchmark.measure(serversToBenchmark, routesToBenchmark, function(err, results){
      err.should.be.eql("Expected Status code was 200 but I got a 403 for My api/errorRoute");
      done();
    });

  });

  it('should work without the optional options parameter', function(done) {
    apiBenchmark.measure(serversToBenchmark, { simpleRoute: endpoints.simpleRoute }, function(err, results){
      results['My api'].should.not.be.eql(null);
      done();
    });
  });

  it('should correctly handle post routes', function(done) {
    apiBenchmark.measure(serversToBenchmark, { postRoute: endpoints.postRoute }, function(err, results){
      results['My api'].postRoute.should.not.be.eql(null);
      done();
    });
  });

  it('should correctly handle delete routes', function(done) {
    apiBenchmark.measure(serversToBenchmark, { deleteRoute: endpoints.deleteRoute }, function(err, results){
      results['My api'].deleteRoute.should.not.be.eql(null);
      done();
    });
  });
});