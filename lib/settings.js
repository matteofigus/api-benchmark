'use strict';

module.exports = {
  errorCodes: {
    HTTP_STATUS_CODE_NOT_MATCHING: 'httpStatusCodeNotMatching',
    MAX_MEAN_EXCEEDED: 'maxMeanExceeded',
    MAX_SINGLE_MEAN_EXCEEDED: 'maxSingleMeanExceeded'
  },
  errorMessages: {
    GENERIC_ERROR: 'An error occurred while benchmarking {0}: {1}',
    HTTP_STATUS_CODE_NOT_MATCHING: 'Expected Status code was {0} but I got a {1} for {2}',
    MAX_MEAN_EXCEEDED: 'Mean should be below {0}',
    MAX_SINGLE_MEAN_EXCEEDED: 'Mean across all concurrent requests should be below {0}',
    VALIDATION_CALLBACK: 'Callback argument is not valid',
    VALIDATION_ENDPOINTS: 'Endpoints argument is not valid',
    VALIDATION_ENDPOINT_VERB: 'Endpoints argument is not valid - found an unsupported http verb',
    VALIDATION_SERVICES: 'Services argument is not valid'
  },
  successMessages: {
    FASTEST_ENDPOINT: 'Fastest is {0}',
    FASTEST_SERVICE: 'Fastest Service is {0}',
    CYCLE_MESSAGE: '{0} x {1} ops/sec {2}% ({3} run{4} sampled)'
  }
};
