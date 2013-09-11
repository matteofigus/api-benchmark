var benchmarkRunner = require('benchmark');
var SuitesManager = require('./suites-manager');
var _ = require('underscore');

var apiBenchmark = {
  compare: function(services, endpoints, options, callback){

    if(typeof options === 'function'){
      callback = options;
      options = {};
    }

    var suites = new SuitesManager(benchmarkRunner);

    suites.setOptions(options)
          .addEndpoints(endpoints)
          .addServices(services)
          .onBenchResults(callback)
          .runNext();
  }
};

module.exports.compare = apiBenchmark.compare;