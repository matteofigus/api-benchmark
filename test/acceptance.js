var apiBenchmark = require('./../index');
var express = require('express');
var should = require('should');
var superagent = require('superagent');

var services = {};

var endpoints = { simpleRoute: '/getJson', secondaryRoute: '/getJson2' };

var setupServer = function(name, serverPort, delay, callback){
  services[name] = "http://localhost:" + serverPort;
  
  var app = express();
  
  app.get(endpoints.simpleRoute, function(req, res){
    setTimeout(function(){
      res.json({ message: "ok" });
    }, delay);
  });   

  app.get(endpoints.secondaryRoute, function(req, res){
    setTimeout(function(){
      res.json({ message: "secondaryRoute" });
    }, delay);
  }); 

  app.listen(serverPort, callback);
};

var setupServers = function(callback){
  var servers = 2;

  var done = function(){
    servers --;
    if(servers == 0)
      callback();
  };

  setupServer("Slow server", 3006, 200, done);
  setupServer("Fast server", 3007, 0, done);
};

describe('compare function', function(){

  before(function(done){
    setupServers(done);
  });

  it('should correctly recognize the fastest service', function(done) {
    apiBenchmark.compare(services, { simpleRoute: endpoints.simpleRoute }, { maxTime: 0.5 }, function(results){
      results['Fast server'].isFastest.should.be.eql(true);
      done();
    });
  });

  it('should work without the optional options parameter', function(done) {
    apiBenchmark.compare(services, { simpleRoute: endpoints.simpleRoute }, function(results){
      results['Fast server'].isFastest.should.be.eql(true);
      done();
    });
  });

  it('should correctly compare multiple routes', function(done) {
    apiBenchmark.compare(services, endpoints, { debug: true }, function(results){
      results['Fast server'].isFastest.should.be.eql(true);
      done();
    });
  });
});