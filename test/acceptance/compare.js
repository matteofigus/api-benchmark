var apiBenchmark = require('./../../index');
var should = require('should');
var TestServers = require('./../fixtures/test-servers');

describe('compare function', function(){

  var testServers,
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

    var servers = [{ name: "Slow server", port: 3006, delay: 200 }, 
                   { name: "Fast server", port: 3007, delay: 0}];

    testServers = new TestServers(endpoints, servers, done);
  });

  after(function(done){
    testServers.kill(done);
  });

  it('should correctly recognize the fastest service', function(done) {
    apiBenchmark.compare(testServers.services, { simpleRoute: endpoints.simpleRoute }, { maxTime: 0.5 }, function(results){
      results['Fast server'].isFastest.should.be.eql(true);
      done();
    });
  });

  it('should work without the optional options parameter', function(done) {
    apiBenchmark.compare(testServers.services, { simpleRoute: endpoints.simpleRoute }, function(results){
      results['Fast server'].isFastest.should.be.eql(true);
      done();
    });
  });

  it('should correctly compare multiple routes', function(done) {
    apiBenchmark.compare(testServers.services, { simpleRoute: endpoints.simpleRoute, secondaryRoute: endpoints.secondaryRoute }, function(results){
      results['Fast server'].isFastest.should.be.eql(true);
      done();
    });
  });

  it('should correctly handle post routes', function(done) {
    apiBenchmark.compare(testServers.services, { postRoute: endpoints.postRoute }, function(results){
      results['Fast server'].isFastest.should.be.eql(true);
      done();
    });
  });

  it('should correctly handle delete routes', function(done) {
    apiBenchmark.compare(testServers.services, { deleteRoute: endpoints.deleteRoute }, function(results){
      results['Fast server'].isFastest.should.be.eql(true);
      done();
    });
  });
});