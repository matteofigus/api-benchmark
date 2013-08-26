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
  compare: function(services, endpoints, options, callback){

    if(typeof options === 'function'){
      callback = options;
      options = {};
    }

    var suites = [];

    options = apiBenchmark.extendOptions(options);

    for(endpoint in endpoints)
      suites.push({
        name: endpoint,
        endpoint: endpoints[endpoint],
        bench: new Benchmark.Suite
      });

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
  finalizeResult: function(results, options){
    var getServiceAverage = function(service){
      var endpointsCount = 0;
      var average = {
        name: service,
        stats: {
          moe: 0,
          rme: 0,
          deviation: 0,
          variance: 0,
          mean: 0,
          sem: 0
        },
        cycles: 0,
        hz: 0
      };

      for(var endpoint in results[service]){
        endpointsCount++;
        average.stats.moe += results[service][endpoint].stats.moe;
        average.stats.rme += results[service][endpoint].stats.rme;
        average.stats.deviation += results[service][endpoint].stats.deviation;
        average.stats.variance += results[service][endpoint].stats.variance;
        average.stats.mean += results[service][endpoint].stats.mean;
        average.stats.sem += results[service][endpoint].stats.sem;
        average.cycles += results[service][endpoint].cycles;
        average.hz += results[service][endpoint].hz;
      };

      average.stats.moe /= endpointsCount;
      average.stats.rme /= endpointsCount;
      average.stats.deviation /= endpointsCount;
      average.stats.variance /= endpointsCount;
      average.stats.mean /= endpointsCount;
      average.stats.sem /= endpointsCount;
      average.cycles /= endpointsCount;
      average.hz /= endpointsCount;

      return average;
    };

    var averages = [];
    for(service in results)
      averages.push(getServiceAverage(service)); 

    averages = _.filter(averages, function(average){
      return average.cycles && isFinite(average.hz);
    });

    averages = _.sortBy(averages, function(average){
      return average.stats.mean + average.stats.moe;
    });

    if(averages.length > 1){
      results[averages[0].name].isFastest = true;
      results[averages[averages.length - 1].name].isSlowest = true;
    }

    if(options.debug)
      console.log('Fastest Service is ' + averages[0].name);

    console.log(results);
    return results;
  }
};

module.exports.compare = apiBenchmark.compare;