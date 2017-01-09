'use strict';

var _ = require('underscore');
var url = require('url');

module.exports = function(agent){
  this.agent = agent;

  var evalIfFunction = function(variable){
    return _.isFunction(variable) ? variable() : variable;
  };

  this.make = function(options, callback){
    var data = evalIfFunction(options.data) || {},
        query = evalIfFunction(options.query) || {},
        route = evalIfFunction(options.route) || '',
        headers = evalIfFunction(options.headers) || {},
        method = options.method === 'delete' ? 'del' : options.method,
        requestUrl = url.resolve(options.service, route),
        request = this.agent[method](requestUrl);

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
