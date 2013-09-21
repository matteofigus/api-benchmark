var express = require('express');

module.exports = function(endpoints, servers, callback){
  this.services = {};
  this.endpoints = endpoints;
  this.app = {};

  this.setupRoute = function(route, response, delay){
    if(typeof route === 'string')
      route = {
        route: route,
        method: 'get'
      };

    var routeAddress = (route.route.indexOf("?") >= 0) ?
                       route.route.substr(0, route.route.indexOf("?")) :
                       route.route;

    this.app[route.method](routeAddress, function(req, res){
      setTimeout(function(){
        res.json(response);
      }, delay);
    });   
    return this;
  };

  this.setupServer = function(name, serverPort, delay, callback){

    this.services[name] = "http://localhost:" + serverPort;
    this.app = express();

    for(routeName in this.endpoints)
      this.setupRoute(this.endpoints[routeName], { message: routeName }, delay);

    this.app.listen(serverPort, callback);
  };

  var serversInitialized = 0;
  var done = function(){
    serversInitialized ++;
    if(serversInitialized == servers.length)
      callback();
  };

  for(var i = 0; i < servers.length; i++)
    this.setupServer(servers[i].name, servers[i].port, servers[i].delay, done); 
};