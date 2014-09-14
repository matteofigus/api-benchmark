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
        callback(null, {
          header: response.header,
          statusCode: response.statusCode,
          body: response.text,
          type: response.type
        });
    });
  },
  setup: function(suiteName, suiteHref, suite, requestAgent){
    var self = this,
        req = _.extend(_.clone(suite.endpoint), { url: suiteHref }),
        suiteOptions = {
          expectedStatusCode: suite.endpoint.expectedStatusCode,
          maxMean: suite.endpoint.maxMean,
          maxSingleMean: suite.endpoint.maxSingleMean,
          method: suite.endpoint.method
        },
        suiteRequest = {};

    if(!!suite.endpoint.headers)
      if(typeof(suite.endpoint.headers) !== 'function')
        suiteRequest.headers = suite.endpoint.headers;
      else
        suiteRequest.headers = "Dynamic headers";

    if(!!suite.endpoint.data)
      if(typeof(suite.endpoint.data) !== 'function')
        suiteRequest.data = suite.endpoint.data;
      else
        suiteRequest.data = "Dynamic data";

    suite.runner.add(suiteName, suiteHref, suiteOptions, suiteRequest, function(done){
      self.make(req, suite, suiteName, requestAgent, done);
    });
  }
};