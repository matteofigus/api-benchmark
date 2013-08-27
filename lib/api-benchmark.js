var Benchmark = require('benchmark');
var superagent = require('superagent');
var _ = require('underscore');

var apiBenchmark = {
  compare: function(services, endpoints, options, callback){

    if(typeof options === 'function'){
      callback = options;
      options = {};
    }

    var self = apiBenchmark,
        options = self.extendOptions(options),
        suites = self.createSuites(endpoints);
     
    self.addBenchmarks(services, suites, options)
        .onBenchResults(services, suites, options, function(results){
          callback(self.finalizeResult(results, options));
        })
        .start(suites);
  },
  createSuites: function(endpoints){
    var suites = [];
    for(endpoint in endpoints)
      suites.push({
        name: endpoint,
        endpoint: endpoints[endpoint],
        bench: new Benchmark.Suite
      });
    return suites;
  },
  extendOptions: function(options){
    return _.extend(options, {
      defer: true,
      debug: options.debug || false,
      maxTime: options.maxTime || 2
    });
  },
  start: function(suites){
    if(suites && suites.length > 0)
      return suites[0].bench.run({ async: true });
  },
  onBenchResults: function(services, suites, options, callback){
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
    return this;
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
    return this;
  }, 
  benchmarks: {
    getAverage: function(benchmarks){

      var averages = [];
      for(benchmarkName in benchmarks)
        averages.push(this.getBenchmarkAverage(benchmarks, benchmarkName)); 

      var succesfulAverages = this.getSuccessful(averages);

      return this.sort(succesfulAverages);
    },
    getBenchmarkAverage: function(benchmarks, benchmarkName){
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
  finalizeResult: function(results, options){
    var averages = apiBenchmark.benchmarks.getAverage(results);

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