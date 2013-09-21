module.exports = function(agent){
  this.agent = agent;

  this.make = function(options, callback){
    var data = options.data || {},
        headers = options.headers || {},
        method = options.method == 'delete' ? 'del' : options.method, // <- superagent fix
        request = this.agent[method](options.url);

    if(data != {})
      request.send(data);

    for(headerName in headers)
      request.set(headerName, headers[headerName]);

    request.end(function(response){
      callback(response);
    });
  };
};
