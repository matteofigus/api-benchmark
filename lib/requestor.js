var events = require('events');

module.exports = {
  make: function(req, suite, suiteName, requestHandler, callback){
    requestHandler.make(req, function(response){

      if(!!suite.endpoint.expectedStatusCode && suite.endpoint.expectedStatusCode != response.status)
        return callback({ 
          message: "Expected Status code was " + suite.endpoint.expectedStatusCode + " but I got a " + response.status + " for " + suiteName,
          type: "httpStatusCodeNotMatching"
          }, false);

      callback(null, true);
    });
  },
  setup: function(suiteName, suiteHref, suite, options, requestHandler){
    var self = this,
        req = {
          url: suiteHref,
          method: suite.endpoint.method,
          data: suite.endpoint.data,
          headers: suite.endpoint.headers
        };

    suite.runner.add(suiteName, options, function(done){
      self.make(req, suite, suiteName, requestHandler, function(err, success){

        if(err)
          suite.runner.emitError(err);
        else
          done();
      });
    });
  }
};