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
};