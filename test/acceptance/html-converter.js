'use strict';

var apiBenchmark = require('./../../index');
var should = require('should');
var TestServers = require('http-test-servers');

describe('getHtml function', function(){

  var testServers,
      server = { 'My api': { port: 3006, delay: 0 },
                 'My slow api': { port: 3007, delay: 100 }},
      serversToBenchmark = { 'My api': 'http://localhost:3006/'},
      slowServersToBenchmark = { 'My api': 'http://localhost:3007/'},
      endpoints = {
        simpleRoute: '/getJson'
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

  it('should correctly convert results into a html report', function(done){
    apiBenchmark.measure(serversToBenchmark, {simpleRoute: endpoints.simpleRoute}, function(err, results){

      apiBenchmark.getHtml(results, function(err, html){
        html.should.not.be.eql(null);
        html.indexOf('<html>').should.be.above(0);
        done();
      });

    });
  });
});
