var debugMessage = require('./debug-message');
var ResultsHandler = require('./results-handler');
var RequestHandler = require('./request-handler');
var superagent = require('superagent');
var validator = require('./validator');
var _ = require('underscore');

var requestHandler = new RequestHandler(superagent);

module.exports = function(BenchmarkRunner){

  this.options = {};
  this.current = 0;
  this.suites = []; 
  this.services = {};

  return _.extend(this, {
    addEndpoints: function(endpoints){
      validator.checkEndpoints(endpoints);

      for(endpoint in endpoints){
        if(typeof endpoints[endpoint] === 'string')
          endpoints[endpoint] = {
            route: endpoints[endpoint],
            method: 'get'
          };

        this.suites.push({
          name: endpoint,
          endpoint: endpoints[endpoint],
          bench: new BenchmarkRunner.Suite
        });
      }
      return this;
    },
    addServices: function(services){
      validator.checkServices(services);
      this.services = services;

      for(service in this.services){
        for(var i = 0; i < this.suites.length; i++){
          (function(serviceName, servicePath, suite, options){
            suite.bench.add(serviceName + '/' + suite.name, function(deferred){

              requestHandler.make({
                url: servicePath + suite.endpoint.route,
                method: suite.endpoint.method,
                data: suite.endpoint.data
              }, function(response){
                deferred.resolve();
              });

            }, options);
          }(service, this.services[service], this.suites[i], this.options));    
        }
      } 
      return this;
    },
    onBenchResults: function(callback){
      validator.checkCallback(callback);

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

            if(isLast)
              callback(resultsHandler.get());
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
        debug: options.debug || false,
        maxTime: options.maxTime || 2
      });
      return this;
    },
    start: function(){
      this.current = 0;
      this.runNext();
    }
  });  
};