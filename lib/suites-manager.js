var Benchmark = require('benchmark');
var ResultsHandler = require('./results-handler');
var superagent = require('superagent');
var _ = require('underscore');

module.exports = function(endpoints, services, options){
  this.suites = [], 
  this.current = 0,
  this.options = options,
  this.services = services,
  this.endpoints = endpoints;

  for(endpoint in this.endpoints)
    this.suites.push({
      name: endpoint,
      endpoint: this.endpoints[endpoint],
      bench: new Benchmark.Suite
    });

  return _.extend(this, {
    addBenchmarks: function(){
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
      var self = this, 
          resultsHandler = new ResultsHandler(services, options);

      for(var i = 0; i < this.suites.length; i++){
        (function(current, isLast, options){

          current.bench.on('cycle', function(event) {
            if(options.debug)
              console.log(String(event.target));
          });

          current.bench.on('complete', function() {
            if(options.debug)
              console.log('Fastest is ' + this.filter('fastest').pluck('name'));

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
    }
  });  
};