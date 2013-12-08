var BenchmarkRunnerHandler = require('./benchmark-runner-handler');
var RequestAgent = require('./request-agent');
var requestHandler = require('./request-handler');
var ResultsHandler = require('./results-handler');
var sanitise = require('./sanitise');
var validator = require('./validator');
var _ = require('underscore');

module.exports = function(BenchmarkRunner, agent, debugHelper){

  this.options = {};
  this.current = 0;
  this.hrefs = {};
  this.routes = []; 
  this.services = {};
  this.requestAgent = new RequestAgent(agent);

  return _.extend(this, {
    addEndpoints: function(endpoints){
      if(!this.validate(validator.checkEndpoints, endpoints))
        return this;

      for(endpointName in endpoints){
        this.routes.push({
          name: endpointName,
          endpoint: sanitise.endpoint(endpointName, endpoints[endpointName]),
          runner: new BenchmarkRunnerHandler(BenchmarkRunner, this.options)
        });
      }
      return this;
    },
    addServices: function(services){
      if(!this.validate(validator.checkServices, services))
        return this;

      this.services = services;

      _.forEach(this.services, function(service, serviceName){
        _.forEach(this.routes, function(route){

          var routeHref = service + route.endpoint.route,
              routeName = serviceName + '/' + route.name, 
              self = this;

          this.hrefs[routeName] = routeHref;
          
          (requestHandler.setup(routeName, routeHref, route, self.requestAgent));    
        }, this);
      }, this); 

      return this;
    },
    handleErrors: function(route){
      var self = this;

      route.runner.onError(function(error){
        debugHelper.log('An error occurred: ' + error.message);
        self.terminate(error.message);
      })
    },
    logCycleResults: function(route){
      route.runner.onCycle(function(e){
        debugHelper.simpleLog(String(e.target));
      });
    },
    logComparisonResult: function(route, callback){
      route.runner.onComplete(function(e){
        if(_.has(e, '1'))
          debugHelper.log('Fastest is ' + e.fasterName);
        
        callback(e);
      });
    },
    logFinalComparisonResult: function(allResults){
      if(_.keys(allResults).length > 1){

        var fasterName = _.compact(_.map(allResults, function(result, key){ 
          if(result.isFastest == true) 
            return key; 
        }))[0];
        
        debugHelper.simpleLog('Fastest Service is ' + fasterName);
      }
    },
    onBenchResults: function(callback){
      this.validate(validator.checkCallback, callback);
      this.callback = callback;

      var self = this,
          resultsHandler = new ResultsHandler(this.services);

      _.forEach(this.routes, function(route, i){

        var isLast = (i == self.routes.length - 1),
            next = self.processNextResult(isLast, resultsHandler);

        self.handleErrors(route);
        self.logCycleResults(route);
        self.logComparisonResult(route, function(results){
          resultsHandler.set(results, route.name, self.hrefs);
          next();
        });
      });
      
      return this;
    },
    processNextResult: function(isLast, resultsHandler){

      var self = this;

      return function(){
        if(isLast && !self.callbackDone){
          self.callbackDone = true;
          var allResults = resultsHandler.get();
          self.logFinalComparisonResult(allResults);
          self.callback(null, allResults);
        } else 
          self.runNext();
      };
    },
    runNext: function(){
      if(this.routes && this.routes.length > 0 && this.routes[this.current]){
        this.routes[this.current].runner.run();      
        this.current++;
      }
    }, 
    setOptions: function(options){
      this.options = sanitise.options(options)

      if(!this.options.debug)
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
      if(this.error && !this.callbackDone){
        callbackDone = true;
        return this.callback(this.error, null);
      }
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