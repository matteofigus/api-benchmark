var benchmarkUtils = require('./benchmark-utils');
var _ = require('underscore');

module.exports = function(services){

  this.results = {};
  this.serviceNames = [];

  for(service in services){
    this.results[service] = {};
    this.serviceNames.push(service);
  }
  
  this.set = function(benchmarks, currentName, hrefs){
    for(index in benchmarks)
      if(this.results[this.serviceNames[index]]){
        this.results[this.serviceNames[index]][currentName] = benchmarkUtils.getRelevantFields(benchmarks[index]);
        this.results[this.serviceNames[index]][currentName].href = hrefs[this.results[this.serviceNames[index]][currentName].name]
      }
  };

  this.get = function(){
    var averages = benchmarkUtils.getAverage(this.results);

    if(averages.length > 1){
      this.results[averages[0].name].isFastest = true;
      this.results[averages[averages.length - 1].name].isSlowest = true;
    }

    return this.results;
  };
};