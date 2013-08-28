var _ = require('underscore');

module.exports = {
  getAverage: function(benchmarks){

    var averages = [];
    for(benchmarkName in benchmarks)
      averages.push(this.getBenchmarkAverage(benchmarks, benchmarkName)); 

    var succesfulAverages = this.getSuccessful(averages);

    return this.sort(succesfulAverages);
  },
  getBenchmarkAverage: function(benchmarks, benchmarkName){
    var current = benchmarks[benchmarkName],
        stats = this.getStats(current),
        av = this.getFieldAverage;

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
      cycles: av(current, 'cycles'),
      hz: av(current, 'hz'),
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
};