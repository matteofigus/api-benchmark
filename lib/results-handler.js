'use strict';

var benchmarkUtils = require('./benchmark-utils');
var _ = require('underscore');

module.exports = function(services){

  this.results = {};
  this.serviceNames = [];

  for( var service in services){
		if (services.hasOwnProperty(service)) {
			this.results[service] = {};
			this.serviceNames.push(service);
		}
  }

  return _.extend(this, {
    set: function(benchmarks, currentName) {
			for ( var index in benchmarks ) {
				if ( benchmarks.hasOwnProperty( index ) ) {
					if ( this.results[this.serviceNames[index]] ) {
						this.results[this.serviceNames[index]][currentName] = benchmarks[index];
					}
				}
			}
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
