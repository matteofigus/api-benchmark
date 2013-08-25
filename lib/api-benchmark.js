var Benchmark = require('benchmark');
var superagent = require('superagent');

module.exports.compare = function(services, endpoints, options, callback){
  if(typeof options === 'function'){
    callback = options;
    options = {};
  }

  options.defer = true;
  options.debug = options.debug || false;

  var suites = [], suitesDescriptions = [];

  for(endpoint in endpoints){
    suites.push(new Benchmark.Suite);
    suitesDescriptions.push(endpoint);
  }

  for(var i = 0; i < suites.length; i++){
    (function(current, next){
      current.on('cycle', function(event) {
        if(options.debug)
          console.log(String(event.target));
      });
      current.on('complete', function() {
        if(options.debug)
          console.log('Fastest is ' + this.filter('fastest').pluck('name'));
        if(next)
          next.run({ async: true });
        else 
          callback(this);
      });
    }(suites[i], (i == suites.length - 1) ? null : suites[i + 1]));
  }

  for(service in services){
    for(var i = 0; i < suites.length; i++){
      (function(serviceName, servicePath, suite, endPointName){
        suite.add(serviceName + '/' + endPointName, function(deferred){
          superagent.get(servicePath + endpoints[endPointName], function(apiResponse){
            deferred.resolve();
          });
        }, options);
      }(service, services[service], suites[i], suitesDescriptions[i]));    
    }
  }

  suites[0].run({ async: true });
};