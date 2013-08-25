var apiBenchmark = require('./../index');
var express = require('express');
var giveMe = require('give-me');
var should = require('should');
var superagent = require('superagent');

var services = {};

var endpoints = { simpleRoute: '/getJson' };

var options = {
  debug: true,
  maxTime: 2
}

var setupServer = function(name, serverPort, delay, callback){
  services[name] = "http://localhost:" + serverPort;
  
  var app = express();
  
  app.get(endpoints.simpleRoute, function(req, res){
    setTimeout(function(){
      res.json({ message: "ok" });
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

    apiBenchmark.compare(services, endpoints, options, function(results){
      results.should.be.a('object');
      results.filter('fastest').pluck('name')[0].should.be.eql("Fast server/simpleRoute");
      done();
    });
  });
});