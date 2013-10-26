var apiBenchmark = require('./../../index');
var should = require('should');
var TestServers = require('./../fixtures/test-servers');

describe('misure function', function(){

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
    var server = { name: "My api", port: 3006, delay: 0 };
    testServers = new TestServers(endpoints, [server], done);
  });

  after(function(done){
    testServers.kill(done);
  });

  it('should correctly misure the performances of the service', function(done) {
    apiBenchmark.misure(testServers.services, endpoints, { maxTime: 0.5 }, function(results){
      results['My api'].should.not.be.eql(null);
      done();
    });
  });
});