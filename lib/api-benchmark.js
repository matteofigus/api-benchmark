var benchmarkRunner = require('benchmark');
var DebugHelper = require('./debug-helper');
var superagent = require('superagent');
var SuitesManager = require('./suites-manager');

var suites = {
  setup: function(debugHelper){
    this.suites = new SuitesManager(benchmarkRunner, superagent, debugHelper);
    return this;
  },
  start: function(services, endpoints, options, callback){

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
    suites.setup(new DebugHelper('compare'))
          .start(services, endpoints, options, callback);
  },
  measure: function(service, endpoints, options, callback){
    suites.setup(new DebugHelper('measure'))
          .start(service, endpoints, options, callback);
  }
};