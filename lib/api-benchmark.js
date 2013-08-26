var Benchmark = require('benchmark');
var superagent = require('superagent');
var _ = require('underscore');

var apiBenchmark = {
  extendOptions: function(options){
    options.defer = true;
    options.debug = options.debug || false;
    options.maxTime = options.maxTime || 2;
    return options;
  },
  compare: function(services, endpoints, options, callback){

    var suites = [], results = {};

    if(typeof options === 'function'){
      callback = options;
      options = {};
    }

    options = apiBenchmark.extendOptions(options);

    var suitesDescriptions = [];
    apiBenchmark.addBenchmarks(services, endpoints, suites, suitesDescriptions, options, results);

    var servicesDescriptions = [];
    for(service in services)
      servicesDescriptions.push(service);

    for(var i = 0; i < suites.length; i++){
      (function(current, suiteDescription, servicesDescriptions, next){
        current.on('cycle', function(event) {
          if(options.debug)
            console.log(String(event.target));
        });
        current.on('complete', function() {
          if(options.debug)
            console.log('Fastest is ' + this.filter('fastest').pluck('name'));

          for(index in this){
            if(results[servicesDescriptions[index]]){
              var currentItem = this[index];
              results[servicesDescriptions[index]][suiteDescription] = {
                name: currentItem.name,
                stats: currentItem.stats,
                cycles: currentItem.cycles,
                hz: currentItem.hz
              };
            }
          }

          if(next)
            next.run({ async: true });
          else 
            callback(apiBenchmark.finalizeResult(results, options));
        });
      }(suites[i], suitesDescriptions[i], servicesDescriptions, (i == suites.length - 1) ? null : suites[i + 1]));
    }


    suites[0].run({ async: true });
  },
  addBenchmarks: function(services, endpoints, suites, suitesDescriptions, options, results){

    for(endpoint in endpoints){
      suites.push(new Benchmark.Suite);
      suitesDescriptions.push(endpoint);
    }

    for(service in services){
      results[service] = {};
      for(var i = 0; i < suites.length; i++){
        (function(serviceName, servicePath, suite, endPointName){
          suite.add(serviceName + '/' + endPointName, function(deferred){
            superagent.get(servicePath + endpoints[endPointName], function(apiResponse){
              deferred.resolve();
            });
          }, options);
        }(service, services[service], suites[i], suitesDescriptions[i]));    
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
    }

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

    return results;
  }
};

module.exports.compare = apiBenchmark.compare;