'use strict';

var benchmarkUtils = require('./benchmark-utils');
var _ = require('underscore');

module.exports = function(services){

  this.results = {};
  this.serviceNames = [];

  _.forEach(services, function(v, k){
    this.results[k] = {};
    this.serviceNames.push(k);
  }, this);

  return _.extend(this, {
    set: function(benchmarks, currentName) {
      _.forEach(benchmarks, function(benchmark, k){
        if(this.results[this.serviceNames[k]]){
          this.results[this.serviceNames[k]][currentName] = benchmark;
        }
      }, this);
    },
    get: function(){
      var averages = benchmarkUtils.getAverage(this.results);

      if(averages.length > 1){
        this.results[averages[0].name].isFastest = true;
        this.results[averages[averages.length - 1].name].isSlowest = true;
      }

      return this.results;
    }
  });
};
