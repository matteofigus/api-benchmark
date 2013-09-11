var debugMessage = require('./debug-message');
var ResultsHandler = require('./results-handler');
var superagent = require('superagent');
var _ = require('underscore');

module.exports = function(BenchmarkRunner){
  this.options = {};

  return _.extend(this, {
    addEndpoints: function(endpoints){
      if(!endpoints || typeof endpoints !== 'object' || Array.isArray(endpoints) || _.keys(endpoints).length < 1)
        throw new Error("Endpoints argument is not valid");

      this.current = 0;
      this.suites = []; 
      for(endpoint in endpoints)
        this.suites.push({
          name: endpoint,
          endpoint: endpoints[endpoint],
          bench: new BenchmarkRunner.Suite
        });
      return this;
    },
    addServices: function(services){
      if(!services || typeof services !== 'object' || Array.isArray(services) || _.keys(services).length < 1)
        throw new Error("Services argument is not valid");

      this.services = services;
      for(service in this.services){
        for(var i = 0; i < this.suites.length; i++){
          (function(serviceName, servicePath, suite, options){
            suite.bench.add(serviceName + '/' + suite.name, function(deferred){
              superagent.get(servicePath + suite.endpoint, function(apiResponse){
                deferred.resolve();
              });
            }, options);
          }(service, this.services[service], this.suites[i], this.options));    
        }
      } 
      return this;
    },
    onBenchResults: function(callback){
      if(!callback || typeof callback !== 'function')
        throw new Error("Callback argument is not valid");
      var self = this, 
          resultsHandler = new ResultsHandler(this.services, this.options);

      for(var i = 0; i < this.suites.length; i++){
        (function(current, isLast, options){

          if(options.debug)
            current.bench.on('cycle', function(event) {
              console.log(String(event.target));
            });

          current.bench.on('complete', function() {
            if(options.debug)
              debugMessage('Fastest is ' + this.filter('fastest').pluck('name'));

            resultsHandler.set(this, current.name);

            if(!isLast)
              self.runNext();
            else 
              callback(resultsHandler.get());
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
      if(!options)
        options = {};

      this.options = _.extend(options, {
        defer: true,
        debug: options.debug || false,
        maxTime: options.maxTime || 2
      });
      return this;
    }
  });  
};