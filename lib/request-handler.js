var format = require('./format');
var settings = require('./settings');
var _ = require('underscore');

module.exports = {
  make: function(req, suite, suiteName, requestAgent, callback){
    requestAgent.make(req, function(err, response){

      if(err){
        var code = err.code || 'Unknown',
            message = err.message || code;

        return callback({
          code: code,
          message: message
        }, false);
      }
      else if(!!suite.endpoint.expectedStatusCode && suite.endpoint.expectedStatusCode != response.status)
        return callback({ 
          code: settings.errorCodes.HTTP_STATUS_CODE_NOT_MATCHING,
          message: format(settings.errorMessages.HTTP_STATUS_CODE_NOT_MATCHING, suite.endpoint.expectedStatusCode, response.status, suiteName)
        }, false);
      else
        callback(null, true);
    });
  },
  setup: function(suiteName, suiteHref, suite, requestAgent){
    var self = this,
        req = _.extend(_.clone(suite.endpoint), { url: suiteHref }),
        suiteOptions = {
          expectedStatusCode: suite.endpoint.expectedStatusCode,
          maxMean: suite.endpoint.maxMean,
          maxSingleMean: suite.endpoint.maxSingleMean 
        };

    suite.runner.add(suiteName, suiteHref, suiteOptions, function(done){
      self.make(req, suite, suiteName, requestAgent, done);
    });
  }
};