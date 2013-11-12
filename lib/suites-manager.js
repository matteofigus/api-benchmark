var RequestHandler = require('./request-handler');
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
          bench: new BenchmarkRunner.Suite
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
              suiteName = serviceName + '/' + currentSuite.name;

          this.hrefs[suiteName] = suiteHref;
          
          (this.request.setup(suiteName, suiteHref, currentSuite, this));    
        }, this);
      }, this); 

      return this;
    },
    request: {
      make: function(req, suite, suiteName, requestor, callback){
        requestor.make(req, function(response){

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

        suite.bench.add(suiteName, function(deferred){
          self.make(req, suite, suiteName, context.requestHandler, function(err, success){
            if(err)
              return context.terminate(err);

            deferred.resolve();
          });
        }, context.options);
      }
    },
    onBenchResults: function(callback){
      this.validate(validator.checkCallback, callback);
      this.callback = callback;

      var self = this, 
          resultsHandler = new ResultsHandler(this.services, debugHelper);

      for(var i = 0; i < this.suites.length; i++){

        (function(current, isLast){

          current.bench.on('cycle', function(event) {
            debugHelper.simpleLog(String(event.target));
          });

          current.bench.on('complete', function() {

            debugHelper.logComparisonResult('Fastest is ' + this.filter('fastest').pluck('name'));
            resultsHandler.set(this, current.name, self.hrefs);

            if(isLast)
              callback(null, resultsHandler.get());
            else 
              self.runNext();
          });

        }(this.suites[i], (i == this.suites.length - 1)));
      }
      return this;
    },
    runNext: function(){
      if(this.suites && this.suites.length > 0 && this.suites[this.current]){
        this.suites[this.current].bench.run({ async: true });      
        this.current++;
      }
    }, 
    setOptions: function(options){
      var options = options || {};

      this.options = _.extend(options, {
        defer: true,
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