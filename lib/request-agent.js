'use strict';

var _ = require('underscore');

module.exports = function(agent){
  this.agent = agent;

  var evalIfFunction = function(variable, options){
    return _.isFunction(variable) ? variable(options) : variable;
  };

  this.make = function(options, callback){
    var data = evalIfFunction(options.data, options) || {},
        query = evalIfFunction(options.query, options) || {},
        headers = evalIfFunction(options.headers, options) || {},
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
