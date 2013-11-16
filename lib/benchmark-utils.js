var _ = require('underscore');

var benchmarkUtils = {
  getAverage: function(benchmarks){
    return _.compose(benchmarkUtils.sort, benchmarkUtils.getSuccessful, benchmarkUtils.getBenchmarksAverage)(benchmarks);
  },
  getBenchmarkAverage: function(benchmark, benchmarkName){
    var stats = benchmarkUtils.getStats(benchmark),
        av = benchmarkUtils.getFieldAverage;

    return {
      name: benchmarkName,
      stats: {
        moe: av(stats, 'moe'),
        rme: av(stats, 'rme'),
        deviation: av(stats, 'deviation'),
        variance: av(stats, 'variance'),
        mean: av(stats, 'mean'),
        sem: av(stats, 'sem')
      },
      hz: av(benchmark, 'hz')
    };
  },
  getBenchmarksAverage: function(benchmarks){
    return  _.map(benchmarks, function(benchmark, benchmarkName){ 
      return benchmarkUtils.getBenchmarkAverage(benchmark, benchmarkName); 
    });
  },
  getFieldAverage: function(benchmarks, propertyName){
    var valuesArray = _.pluck(benchmarks, propertyName);
    return _.reduce(valuesArray, function(memo, num){ 
      return memo + num;
    }, 0) / valuesArray.length;
  },
  getRelevantFields: function(benchmark){
    return _.pick(benchmark, 'name', 'stats', 'hz');
  },
  getStats: function(benchmarks){
    return _.map(benchmarks, function(benchmark){ 
      return benchmark.stats; 
    });
  },
  getSuccessful: function(benchmarks){
    return _.filter(benchmarks, function(benchmark){
      return isFinite(benchmark.hz);
    });
  },
  sort: function(benchmarks){
    return _.sortBy(benchmarks, function(benchmark){
      return benchmark.stats.mean + benchmark.stats.moe;
    });
  }
};

module.exports = benchmarkUtils;