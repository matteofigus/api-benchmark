'use strict';

var _ = require('underscore');

module.exports = {
  endpoint: function(endpointName, endpoint){
    var output = _.clone(endpoint);

    if(_.isString(output)) {
      output = { route: output };
		}

    output.method = output.method || 'get';

    return output;
  },
  initialInput: function(services, endpoints, options, callback){
    var output = _.clone({
      services: services,
      endpoints: endpoints,
      options: options,
      callback: callback
    });

    if(_.isFunction(options)){
      output.callback = options;
      output.options = {};
    }

    return output;
  },
  options: function(options){
    var output = options || {};

   return _.extend(output, {
      delay: output.delay || 0,
      debug: output.debug || false,
      maxTime: output.maxTime || 10,
      minSamples: output.minSamples || 20,
      maxConcurrentRequests: output.maxConcurrentRequests || 100,
      runMode: output.runMode || 'sequence',
      stopOnError: output.stopOnError !== undefined ? output.stopOnError : true
    });
  }
};
