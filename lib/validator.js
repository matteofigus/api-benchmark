var _ = require('underscore');

module.exports = {
  checkEndpoints: function(endpoints){
    if(!endpoints || typeof endpoints !== 'object' || Array.isArray(endpoints) || _.keys(endpoints).length < 1)
      throw new Error("Endpoints argument is not valid");

    var methods = _.map(endpoints, function(endpoint){ 
      return typeof endpoint === 'string' ? 'get' : endpoint.method; 
    });

    if(_.without(methods, 'get', 'post', 'put', 'head', 'patch', 'delete', 'trace').length > 0)
      throw new Error("Endpoints argument is not valid - found an unsupported http verb");

    return true;
  },
  checkServices: function(services){    
    if(!services || typeof services !== 'object' || Array.isArray(services) || _.keys(services).length < 1)
      throw new Error("Services argument is not valid");
  },
  checkCallback: function(callback){
    if(!callback || typeof callback !== 'function')
      throw new Error("Callback argument is not valid");
  }
}