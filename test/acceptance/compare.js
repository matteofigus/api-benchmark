var apiBenchmark = require('./../../index');
var should = require('should');
var TestServers = require('http-test-servers');

describe('compare function', function(){

  var testServers,
      servers = { "Slow server": { port: 3006, delay: 200 }, 
                  "Fast server": { port: 3007, delay: 0 }};

  var serversToBenchmark = { "Slow server": "http://localhost:3006",
                             "Fast server": "http://localhost:3007"};

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
    apiBenchmark.compare(serversToBenchmark, { simpleRoute: endpoints.simpleRoute }, { maxTime: 0.5 }, function(err, results){
      results['Fast server'].isFastest.should.be.eql(true);
      done();
    });
  });

  it('should work without the optional options parameter', function(done) {
    apiBenchmark.compare(serversToBenchmark, { simpleRoute: endpoints.simpleRoute }, function(err, results){
      results['Fast server'].isFastest.should.be.eql(true);
      done();
    });
  });

  it('should correctly compare multiple routes', function(done) {
    apiBenchmark.compare(serversToBenchmark, { simpleRoute: endpoints.simpleRoute, secondaryRoute: endpoints.secondaryRoute }, function(err, results){
      results['Fast server'].isFastest.should.be.eql(true);
      done();
    });
  });

  it('should correctly handle post routes', function(done) {
    apiBenchmark.compare(serversToBenchmark, { postRoute: endpoints.postRoute }, function(err, results){
      results['Fast server'].isFastest.should.be.eql(true);
      done();
    });
  });

  it('should correctly handle delete routes', function(done) {
    apiBenchmark.compare(serversToBenchmark, { deleteRoute: endpoints.deleteRoute }, function(err, results){
      results['Fast server'].isFastest.should.be.eql(true);
      done();
    });
  });
});