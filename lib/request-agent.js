'use strict';

var _ = require('underscore');

module.exports = function(agent){
  this.agent = agent;

  var evalIfFunction = function(variable){
    return _.isFunction(variable) ? variable() : variable;
  };

  this.make = function(options, callback){
    var data = evalIfFunction(options.data) || {},
        query = evalIfFunction(options.query) || {},
        headers = evalIfFunction(options.headers) || {},
        method = options.method === 'delete' ? 'del' : options.method,
        request = this.agent[method](options.url);

    if(!_.isEmpty(data)) {
      request.send(data);
		}

    if(!_.isEmpty(query)) {
      request.query(query);
    }

    _.forEach(headers, function(header, headerName){
      request.set(headerName, header);
    });

    request.end(callback);
  };
};
