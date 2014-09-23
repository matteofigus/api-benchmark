'use strict';

var format = require('./format');
var settings = require('./settings');
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
        sem: av(stats, 'sem'),
        p75: av(stats, 'p75'),
        p95: av(stats, 'p95'),
        p99: av(stats, 'p99'),
        p999: av(stats, 'p999')
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

  getDeviation: function(variance){
    return Math.sqrt(variance);
  },
  getHz: function(singleMean){
    return 1/singleMean;
  },
  getSingleMean: function(mean, concurrencyLevel){
    // Mean across all concurrent requests.
    // Should represent the mean for each single request in a multi-concurrent context.

    return mean/concurrencyLevel;
  },
  getMean: function(samples){
    return _.reduce(samples, function(memo, num){
      return memo + num;
    }, 0) / samples.length;
  },
  getMoe: function(samples, sem){
    /**
     * T-Distribution two-tailed critical values for 95% confidence
     * http://www.itl.nist.gov/div898/handbook/eda/section3/eda3672.htm
     */
    var tTable = {
      '1':  12.706,'2':  4.303, '3':  3.182, '4':  2.776, '5':  2.571, '6':  2.447,
      '7':  2.365, '8':  2.306, '9':  2.262, '10': 2.228, '11': 2.201, '12': 2.179,
      '13': 2.16,  '14': 2.145, '15': 2.131, '16': 2.12,  '17': 2.11,  '18': 2.101,
      '19': 2.093, '20': 2.086, '21': 2.08,  '22': 2.074, '23': 2.069, '24': 2.064,
      '25': 2.06,  '26': 2.056, '27': 2.052, '28': 2.048, '29': 2.045, '30': 2.042,
      'infinity': 1.96
    };

    var critical = tTable[Math.round(samples.length - 1) || 1] || tTable.infinity;
    return sem * critical;
  },
  getPercentile: function(samples, ptile){
    var values = _.clone(samples).sort(function (a, b) { return a - b; }),
        pos = ptile * (values.length + 1);

    if (pos < 1) {
      return values[0];
    } else if (pos >= values.length) {
      return values[values.length - 1];
    } else {
      var lower = values[Math.floor(pos) - 1];
      var upper = values[Math.ceil(pos) - 1];

      return lower + (pos - Math.floor(pos)) * (upper - lower);
    }
  },
  getRme: function(moe, mean){
    return (moe / mean) * 100 || 0;
  },
  getSem: function(samples, deviation){
    return deviation / Math.sqrt(samples.length);
  },
  getVariance: function(samples, mean){
    return _.reduce(samples, function(sum, x) {
      return sum + Math.pow(x - mean, 2);
    }, 0) / (samples.length - 1) || 0;
  },

  getRelevantFields: function(benchmark){

    var __ = benchmarkUtils,
        stats = {};

    var result = {
      name: benchmark.name,
      href: benchmark.href,
      stats: {
        sample: benchmark.stats.sample
      },
      errors: benchmark.errors,
      options: benchmark.options,
      request: benchmark.request,
      response: benchmark.response
    };

    stats.mean = __.getMean(benchmark.stats.sample);
    stats.singleMean = __.getSingleMean(stats.mean, benchmark.options.concurrencyLevel);
    result.hz = __.getHz(stats.singleMean);
    stats.variance = __.getVariance(benchmark.stats.sample, stats.mean);
    stats.deviation = __.getDeviation(stats.variance);
    stats.sem = __.getSem(benchmark.stats.sample, stats.deviation);
    stats.moe = __.getMoe(benchmark.stats.sample, stats.sem);
    stats.rme = __.getRme(stats.moe, stats.mean);
    stats.p75 = __.getPercentile(benchmark.stats.sample, 0.75);
    stats.p95 = __.getPercentile(benchmark.stats.sample, 0.95);
    stats.p99 = __.getPercentile(benchmark.stats.sample, 0.99);
    stats.p999 = __.getPercentile(benchmark.stats.sample, 0.999);

    result.stats = _.extend(result.stats, stats);

    return result;
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
  },
  cycleMessage: function(benchmark) {

    var formatNumber = function(number) {
      number = String(number).split('.');
      return number[0].replace(/(?=(?:\d{3})+$)(?!\b)/g, ',') + (number[1] ? '.' + number[1] : '');
    };

    var hz = benchmark.hz,
        stats = benchmark.stats,
        size = stats.sample.length,
        pm = '\xb1';

    return format(settings.successMessages.CYCLE_MESSAGE,
                  benchmark.name,
                  formatNumber(hz.toFixed(hz < 100 ? 2 : 0)),
                  pm + stats.rme.toFixed(2),
                  size,
                  (size === 1 ? '' : 's'));
  }
};

module.exports = benchmarkUtils;
