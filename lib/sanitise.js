var _ = require('underscore');

module.exports = {
  endpoint: function(endpointName, endpoint){
    var output = _.clone(endpoint);

    if(typeof output === 'string')
      output = { route: output };

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

    if(typeof options === 'function'){
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
      maxTime: output.maxTime || 2
    });
  }
}
