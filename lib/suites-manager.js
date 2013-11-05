var ResultsHandler = require('./results-handler');
var RequestHandler = require('./request-handler');
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
      var validationResult = validator.checkEndpoints(endpoints);

      if(validationResult !== true){
        this.error = validationResult;
        return this;
      }

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
      var validationResult = validator.checkServices(services);

      if(validationResult !== true){
        this.error = validationResult;
        return this;
      }

      this.services = services;
      var self = this;

      for(service in this.services){
        for(var i = 0; i < this.suites.length; i++){
          (function(serviceName, servicePath, suite, requestHandler, options){
            var suiteName = serviceName + '/' + suite.name;
            self.hrefs[suiteName] = servicePath + suite.endpoint.route;
            suite.bench.add(suiteName, function(deferred){

              requestHandler.make({
                url: servicePath + suite.endpoint.route,
                method: suite.endpoint.method,
                data: suite.endpoint.data,
                headers: suite.endpoint.headers
              }, function(response){
                if(!suite.endpoint.expectedStatusCode)
                  return deferred.resolve();
                else {
                  if(suite.endpoint.expectedStatusCode != response.status)
                    return self.callback("Expected Status code was " + suite.endpoint.expectedStatusCode + " but I got a " + response.status + " for " + service + "/" + suite.name, null);

                  return deferred.resolve();
                }
              });

            }, options);
          }(service, this.services[service], this.suites[i], this.requestHandler, this.options));    
        }
      } 
      return this;
    },
    onBenchResults: function(callback){
      validator.checkCallback(callback);

      this.callback = callback;

      var self = this, 
          resultsHandler = new ResultsHandler(this.services, this.options, debugHelper);

      for(var i = 0; i < this.suites.length; i++){
        (function(current, isLast, options){

          if(options.debug)
            current.bench.on('cycle', function(event) {
              debugHelper.simpleLog(String(event.target));
            });

          current.bench.on('complete', function() {
            if(options.debug)
              debugHelper.logComparisonResult('Fastest is ' + this.filter('fastest').pluck('name'));

            resultsHandler.set(this, current.name, self.hrefs);

            if(isLast)
              callback(null, resultsHandler.get());
            else 
              self.runNext();
          });
        }(this.suites[i], (i == this.suites.length - 1), this.options));

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
      if(options == null)
        options = {};

      this.options = _.extend(options, {
        defer: true,
        delay: options.delay || 0,
        debug: options.debug || false,
        maxTime: options.maxTime || 2
      });
      return this;
    },
    start: function(){

      if(this.error)
        return this.callback(this.error, null);

      this.current = 0;
      this.runNext();
    }
  });  
};