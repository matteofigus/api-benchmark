var SuitesManager = require('./suites-manager');
var _ = require('underscore');

var apiBenchmark = {
  compare: function(services, endpoints, options, callback){

    if(typeof options === 'function'){
      callback = options;
      options = {};
    }

    var options = apiBenchmark.extendOptions(options),
        suites = new SuitesManager(endpoints, services, options);

    suites.addBenchmarks()
          .onBenchResults(callback)
          .runNext();
  },
  extendOptions: function(options){
    return _.extend(options, {
      defer: true,
      debug: options.debug || false,
      maxTime: options.maxTime || 2
    });
  }
};

module.exports.compare = apiBenchmark.compare;