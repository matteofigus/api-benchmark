var benchmarkRunner = require('benchmark');
var DebugHelper = require('./debug-helper');
var superagent = require('superagent');
var SuitesManager = require('./suites-manager');

var suites = {
  start: function(services, endpoints, options, callback){

    this.suites = new SuitesManager(benchmarkRunner, superagent, new DebugHelper());

    if(typeof options === 'function'){
      callback = options;
      options = {};
    }

    this.suites.setOptions(options)
               .addEndpoints(endpoints)
               .addServices(services)
               .onBenchResults(callback)
               .start();      
  }
};

module.exports = {
  compare: function(services, endpoints, options, callback){
    suites.start(services, endpoints, options, callback);
  },
  measure: function(service, endpoints, options, callback){
    suites.start(service, endpoints, options, callback);
  }
};