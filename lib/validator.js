var settings = require('./settings');
var _ = require('underscore');

module.exports = {
  checkEndpoints: function(endpoints){
    if(!endpoints || typeof endpoints !== 'object' || Array.isArray(endpoints) || _.keys(endpoints).length < 1)
      return (settings.errorMessages.VALIDATION_ENDPOINTS);

    var methods = _.map(endpoints, function(endpoint){ 
      return typeof endpoint === 'string' ? 'get' : (endpoint.method || 'get'); 
    });

    if(_.without(methods, 'get', 'post', 'put', 'head', 'patch', 'delete', 'trace', 'options').length > 0)
      return (settings.errorMessages.VALIDATION_ENDPOINT_VERB);

    return true;
  },
  checkServices: function(services){    
    if(!services || typeof services !== 'object' || Array.isArray(services) || _.keys(services).length < 1)
      return (settings.errorMessages.VALIDATION_SERVICES);

    return true;
  },
  checkCallback: function(callback){
    if(!callback || typeof callback !== 'function')
      throw new Error(settings.errorMessages.VALIDATION_CALLBACK);

    return true;
  }
};