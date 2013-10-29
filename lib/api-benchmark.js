var benchmarkRunner = require('benchmark');
var superagent = require('superagent');
var SuitesManager = require('./suites-manager');

var apiBenchmark = {
  compare: function(services, endpoints, options, callback){

    if(typeof options === 'function'){
      callback = options;
      options = {};
    }

    var suites = new SuitesManager(benchmarkRunner, superagent);

    suites.setOptions(options)
          .addEndpoints(endpoints)
          .addServices(services)
          .onBenchResults(callback)
          .start();
  },
  measure: function(service, endpoints, options, callback){
    return apiBenchmark.compare(service, endpoints, options, callback);
  }
};

module.exports = apiBenchmark;