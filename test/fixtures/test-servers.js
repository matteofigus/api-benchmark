var express = require('express');

module.exports = function(endpoints, servers, callback){
  this.services = {};
  this.endpoints = endpoints;
  this.app = {};

  this.setupRoute = function(name, route, response, delay){
    if(typeof route === 'string')
      route = {
        route: route,
        method: 'get'
      };

    var routeAddress = (route.route.indexOf("?") >= 0) ?
                       route.route.substr(0, route.route.indexOf("?")) :
                       route.route;

    this.app[name][route.method](routeAddress, function(req, res){
      setTimeout(function(){
        res.json(response);
      }, delay);
    });   
    return this;
  };

  this.setupServer = function(name, serverPort, delay, callback){

    this.services[name] = "http://localhost:" + serverPort;
    this.app[name] = express();

    for(routeName in this.endpoints)
      this.setupRoute(name, this.endpoints[routeName], { message: routeName }, delay);

    this.app[name] = this.app[name].listen(serverPort, callback);
  };

  this.kill = function(callback){

    var serverCloseHasCallback = function(server){
      // node.js version 0.6's http.close does not implement a callback :(
      var args = server.close.toString().match (/function\s*\w*\s*\((.*?)\)/)[1].split (/\s*,\s*/); console.log(args)
      return args.length > 0;
    }

    var serversToClose = servers.length,
        serverCloseRequiresCallback = servers.length == 0 ? false : serverCloseHasCallback(this.app[servers[0].name]);

    var tryPerformingCallback = function(){
      if(serversToClose == 0 && typeof callback === 'function')
        callback();
    };

    for(var i = 0; i < servers.length; i++){
      if(!serverCloseRequiresCallback){ console.log('sync conn close');
        this.app[servers[i].name].close();
        serversToClose--;
        tryPerformingCallback();
      } else {
        this.app[servers[i].name].close(function(){ console.log('async conn close');
          serversToClose--;
          tryPerformingCallback();
        });
      }
    }

    tryPerformingCallback();
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