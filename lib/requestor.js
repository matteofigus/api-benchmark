module.exports = {
  make: function(req, suite, suiteName, requestHandler, callback){
    requestHandler.make(req, function(response){

      if(!!suite.endpoint.expectedStatusCode && suite.endpoint.expectedStatusCode != response.status)
        return callback("Expected Status code was " + suite.endpoint.expectedStatusCode + 
                        " but I got a " + response.status + " for " + suiteName, false);

      callback(null, true);
    });
  },
  setup: function(suiteName, suiteHref, suite, context){
    var self = this,
        req = {
          url: suiteHref,
          method: suite.endpoint.method,
          data: suite.endpoint.data,
          headers: suite.endpoint.headers
        };

    suite.runner.add(suiteName, context.options, function(done){
      self.make(req, suite, suiteName, context.requestHandler, function(err, success){
        if(err)
          return context.terminate(err);

        done();
      });
    });
  }
};