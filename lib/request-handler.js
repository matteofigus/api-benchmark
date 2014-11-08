'use strict';

var format = require('./format');
var settings = require('./settings');
var _ = require('underscore');

module.exports = {
  make: function(req, suite, suiteName, requestAgent, callback){
    requestAgent.make(req, function(err, response){

      if(err){
        var code = err.code || 'Unknown';

        return callback({
          code: code,
          message: err.message || code
        }, false);
      }
      else if(!!suite.endpoint.expectedStatusCode && suite.endpoint.expectedStatusCode !== response.status) {
        return callback({
          code: settings.errorCodes.HTTP_STATUS_CODE_NOT_MATCHING,
          message: format(settings.errorMessages.HTTP_STATUS_CODE_NOT_MATCHING, suite.endpoint.expectedStatusCode, response.status, suiteName)
        }, false);
			}
      else {
				callback(null, {
					header: response.header,
					statusCode: response.statusCode,
					body: response.text,
					type: response.type
				});
			}
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

    if(!!suite.endpoint.headers){
      suiteRequest.headers = _.isFunction(suite.endpoint.headers) ? 'Dynamic headers' : suite.endpoint.headers;
		}

    if(!!suite.endpoint.data){
      suiteRequest.data = _.isFunction(suite.endpoint.data) ? 'Dynamic data' : suite.endpoint.data;
		}

    suite.runner.add(suiteName, suiteHref, suiteOptions, suiteRequest, function(done){
      self.make(req, suite, suiteName, requestAgent, done);
    });
  }
};
