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

    var suites = apiBenchmark.initSuites(endpoints);

    options = apiBenchmark.extendOptions(options);

    apiBenchmark.addBenchmarks(services, suites, options);

    apiBenchmark.getBenchResults(services, suites, options, function(results){
      callback(apiBenchmark.finalizeResult(results, options));
    });

    suites[0].bench.run({ async: true });
  },
  getBenchResults: function(services, suites, options, callback){

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

          apiBenchmark.collectResults(this, results, serviceNames, current.name);

          if(next)
            next.bench.run({ async: true });
          else 
            callback(results);
        });
      }(suites[i], serviceNames, (i == suites.length - 1) ? null : suites[i + 1]));
    }
  },
  collectResults: function(benchmarks, results, serviceNames, currentName){
    for(index in benchmarks)
      if(results[serviceNames[index]])
        results[serviceNames[index]][currentName] = _.pick(benchmarks[index], 'name', 'stats', 'cycles', 'hz');
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
  benchmarks: {
    getAverage: function(benchmarks, benchmarkName){
      var stats = this.getStats(benchmarks[benchmarkName]);

      return {
        name: benchmarkName,
        stats: {
          moe: this.getFieldAverage(stats, 'moe'),
          rme: this.getFieldAverage(stats, 'rme'),
          deviation: this.getFieldAverage(stats, 'deviation'),
          variance: this.getFieldAverage(stats, 'variance'),
          mean: this.getFieldAverage(stats, 'mean'),
          sem: this.getFieldAverage(stats, 'sem')
        },
        cycles: this.getFieldAverage(benchmarks[benchmarkName], 'cycles'),
        hz: this.getFieldAverage(benchmarks[benchmarkName], 'hz'),
      };
    },
    getFieldAverage: function(benchmarks, propertyName){
      var valuesArray = _.pluck(benchmarks, propertyName);
      return _.reduce(valuesArray, function(memo, num){ return memo + num; }, 0) / valuesArray.length;
    },
    getStats: function(benchmarks){
      return _.map(benchmarks, function(benchmark){ return benchmark.stats; });
    },
    getSuccessful: function(benchmarks){
      return _.filter(benchmarks, function(benchmark){
        return benchmark.cycles && isFinite(benchmark.hz);
      });
    },
    sort: function(benchmarks){
      return _.sortBy(benchmarks, function(benchmark){
        return benchmark.stats.mean + benchmark.stats.moe;
      });
    }
  },
  getSortedAverages: function(results){

    var benchmarks = apiBenchmark.benchmarks, averages = [];
    for(service in results)
      averages.push(apiBenchmark.benchmarks.getAverage(results, service)); 

    averages = benchmarks.getSuccessful(averages);

    return benchmarks.sort(averages);
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