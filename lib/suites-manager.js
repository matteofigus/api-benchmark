var BenchmarkRunnerHandler = require('./benchmark-runner-handler');
var RequestHandler = require('./request-handler');
var requestor = require('./requestor');
var ResultsHandler = require('./results-handler');
var validator = require('./validator');
var _ = require('underscore');

module.exports = function(BenchmarkRunner, agent, debugHelper){

  this.options = {};
  this.current = 0;
  this.hrefs = {};
  this.suites = []; 
  this.services = {};
  this.requestHandler = new RequestHandler(agent);

  return _.extend(this, {
    addEndpoints: function(endpoints){
      if(!this.validate(validator.checkEndpoints, endpoints))
        return this;

      for(endpoint in endpoints){
        if(typeof endpoints[endpoint] === 'string')
          endpoints[endpoint] = { route: endpoints[endpoint] };

        endpoints[endpoint] = _.extend(endpoints[endpoint], {
          method: endpoints[endpoint].method || 'get'
        });

        this.suites.push({
          name: endpoint,
          endpoint: endpoints[endpoint],
          runner: new BenchmarkRunnerHandler(BenchmarkRunner)
        });
      }
      return this;
    },
    addServices: function(services){
      if(!this.validate(validator.checkServices, services))
        return this;

      this.services = services;

      _.forEach(this.services, function(service, serviceName){
        _.forEach(this.suites, function(currentSuite){

          var suiteHref = service + currentSuite.endpoint.route,
              suiteName = serviceName + '/' + currentSuite.name, 
              self = this;

          this.hrefs[suiteName] = suiteHref;
          
          (requestor.setup(suiteName, suiteHref, currentSuite, self.options, self.requestHandler));    
        }, this);
      }, this); 

      return this;
    },
    handleErrors: function(suite){
      var self = this;

      suite.runner.onError(function(error){
        debugHelper.log('An error occurred: ' + error.message);
        self.terminate(error.message);
      })
    },
    logCycleResults: function(suite){
      suite.runner.onCycle(function(e){
        debugHelper.simpleLog(String(e.target));
      });
    },
    logComparisonResult: function(suite, callback){
      suite.runner.onComplete(function(e){
        if(_.has(e, '1')){
          var message = 'Fastest is ' + e.fasterName;
          debugHelper.log(message);
        }
        callback(e);
      });
    },
    logFinalComparisonResult: function(allResults){
      if(_.keys(allResults).length > 1){
        var fasterName = _.compact(_.map(allResults, function(result, key){ if(result.isFastest == true) return key; }))[0];
        debugHelper.simpleLog('Fastest Service is ' + fasterName);
      }
    },
    onBenchResults: function(callback){
      this.validate(validator.checkCallback, callback);
      this.callback = callback;

      var self = this,
          resultsHandler = new ResultsHandler(this.services);

      _.forEach(this.suites, function(suite, i){

        var isLast = (i == self.suites.length - 1),
            next = self.processNextResult((i == self.suites.length - 1), resultsHandler);

        self.handleErrors(suite);
        self.logCycleResults(suite);
        self.logComparisonResult(suite, function(results){
          resultsHandler.set(results, suite.name, self.hrefs);
          next();
        });
        
      });
      
      return this;
    },
    processNextResult: function(isLast, resultsHandler){

      var self = this;

      return function(){
        if(isLast){
          var allResults = resultsHandler.get();
          self.logFinalComparisonResult(allResults);
          self.callback(null, allResults);
        } else 
          self.runNext();
      };
    },
    runNext: function(){
      if(this.suites && this.suites.length > 0 && this.suites[this.current]){
        this.suites[this.current].runner.run();      
        this.current++;
      }
    }, 
    setOptions: function(options){
      var options = options || {};

      this.options = _.extend(options, {
        delay: options.delay || 0,
        debug: options.debug || false,
        maxTime: options.maxTime || 2
      });

      if(!options.debug)
        debugHelper.shutUp();

      return this;
    },
    start: function(){
      this.terminateIfNotValid();

      this.current = 0;
      this.runNext();
    },    
    terminate: function(err){
      this.error = err;
      this.terminateIfNotValid();
    },
    terminateIfNotValid: function(){
      if(this.error)
        return this.callback(this.error, null);
    },
    validate: function(validateFn, input){
      var validationResult = validateFn(input);

      if(validationResult !== true){
        this.error = validationResult;
        return false;
      }

      return true;
    }
  });  
};