module.exports = function(agent){
  this.agent = agent;

  var evalIfFunction = function(variable){
    return typeof(variable) === 'function' ? variable() : variable;
  };

  this.make = function(options, callback){
    var data = evalIfFunction(options.data) || {},
        headers = evalIfFunction(options.headers) || {},
        method = options.method === 'delete' ? 'del' : options.method,
        request = this.agent[method](options.url);

    if(data != {})
      request.send(data);

    for(headerName in headers)
      request.set(headerName, headers[headerName]);

    request.end(callback);
  };
};
