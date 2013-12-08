var _ = require('underscore');

module.exports = {
  make: function(req, suite, suiteName, requestAgent, callback){
    requestAgent.make(req, function(response){

      if(!!suite.endpoint.expectedStatusCode && suite.endpoint.expectedStatusCode != response.status)
        return callback({ 
          message: "Expected Status code was " + suite.endpoint.expectedStatusCode + " but I got a " + response.status + " for " + suiteName,
          type: "httpStatusCodeNotMatching"
          }, false);

      callback(null, true);
    });
  },
  setup: function(suiteName, suiteHref, suite, requestAgent){
    var self = this,
        req = _.extend(_.clone(suite.endpoint), { url: suiteHref });

    suite.runner.add(suiteName, suiteHref, function(done){
      self.make(req, suite, suiteName, requestAgent, function(err, success){
        if(err)
          suite.runner.emitError(err);
        else
          done();
      });
    });
  }
};