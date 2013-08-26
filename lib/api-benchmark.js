var Benchmark = require('benchmark');
var superagent = require('superagent');
var _ = require('underscore');

var apiBenchmark = {
  extendOptions: function(options){
    return _.extend(options, {
      defer: true,
      debug: options.debug || false,
      maxTime: options.maxTime || 2
    });
  },
  initSuites: function(endpoints){
    var suites = [];
    for(endpoint in endpoints)
      suites.push({
        name: endpoint,
        endpoint: endpoints[endpoint],
        bench: new Benchmark.Suite
      });
    return suites;
  },
  compare: function(services, endpoints, options, callback){

    if(typeof options === 'function'){
      callback = options;
      options = {};
    }

    options = apiBenchmark.extendOptions(options);

    var suites = apiBenchmark.initSuites(endpoints);

    apiBenchmark.addBenchmarks(services, suites, options);

    apiBenchmark.handleBenchResult(services, suites, options, callback);

    suites[0].bench.run({ async: true });
  },
  handleBenchResult: function(services, suites, options, callback){

    var results = {}, serviceNames = [];

    for(service in services){
      results[service] = {};
      serviceNames.push(service);
    }

    for(var i = 0; i < suites.length; i++){
      (function(current, serviceNames, next){
        current.bench.on('cycle', function(event) {
          if(options.debug)
            console.log(String(event.target));
        });
        current.bench.on('complete', function() {
          if(options.debug)
            console.log('Fastest is ' + this.filter('fastest').pluck('name'));

          for(index in this)
            if(results[serviceNames[index]])
              results[serviceNames[index]][current.name] = _.pick(this[index], 'name', 'stats', 'cycles', 'hz');

          if(next)
            next.bench.run({ async: true });
          else 
            callback(apiBenchmark.finalizeResult(results, options));
        });
      }(suites[i], serviceNames, (i == suites.length - 1) ? null : suites[i + 1]));
    }
  },
  addBenchmarks: function(services, suites, options){
    for(service in services){
      for(var i = 0; i < suites.length; i++){
        (function(serviceName, servicePath, suite){
          suite.bench.add(serviceName + '/' + suite.name, function(deferred){
            superagent.get(servicePath + suite.endpoint, function(apiResponse){
              deferred.resolve();
            });
          }, options);
        }(service, services[service], suites[i]));    
      }
    }    
  }, 
  getServiceAverage: function(results, service){

    var getAverage = function(obj, propertyName){
      var arr = _.pluck(obj, propertyName);
      return _.reduce(arr, function(memo, num){ return memo + num; }, 0) / arr.length;
    };

    var stats = _.map(results[service], function(el){ return el.stats; });

    return {
      name: service,
      stats: {
        moe: getAverage(stats, 'moe'),
        rme: getAverage(stats, 'rme'),
        deviation: getAverage(stats, 'deviation'),
        variance: getAverage(stats, 'variance'),
        mean: getAverage(stats, 'mean'),
        sem: getAverage(stats, 'sem')
      },
      cycles: getAverage(results[service], 'cycles'),
      hz: getAverage(results[service], 'hz'),
    };
  },
  getSortedAverages: function(results){

    var averages = [];
    for(service in results)
      averages.push(apiBenchmark.getServiceAverage(results, service)); 

    averages = _.filter(averages, function(average){
      return average.cycles && isFinite(average.hz);
    });

    return _.sortBy(averages, function(average){
      return average.stats.mean + average.stats.moe;
    });
  },
  finalizeResult: function(results, options){
    var averages = apiBenchmark.getSortedAverages(results);

    if(averages.length > 1){
      results[averages[0].name].isFastest = true;
      results[averages[averages.length - 1].name].isSlowest = true;
    }

    if(options.debug)
      console.log('Fastest Service is ' + averages[0].name);

    return results;
  }
};

module.exports.compare = apiBenchmark.compare;