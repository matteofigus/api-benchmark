var benchmarkUtils = require('./benchmark-utils');
var debugMessage = require('./debug-message');
var _ = require('underscore');

module.exports = function(services, options){

  this.options = options;
  this.results = {};
  this.serviceNames = [];

  for(service in services){
    this.results[service] = {};
    this.serviceNames.push(service);
  }
  
  this.set = function(benchmarks, currentName, hrefs){
    for(index in benchmarks)
      if(this.results[this.serviceNames[index]]){
        this.results[this.serviceNames[index]][currentName] = _.pick(benchmarks[index], 'name', 'stats', 'cycles', 'hz');
        this.results[this.serviceNames[index]][currentName].href = hrefs[this.results[this.serviceNames[index]][currentName].name]
      }
  };

  this.get = function(){
    var averages = benchmarkUtils.getAverage(this.results);

    if(averages.length > 1){
      this.results[averages[0].name].isFastest = true;
      this.results[averages[averages.length - 1].name].isSlowest = true;
    }

    if(this.options.debug)
      debugMessage('Fastest Service is ' + averages[0].name);

    return this.results;
  };
}