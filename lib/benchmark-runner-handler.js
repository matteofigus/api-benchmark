var _ = require('underscore');

module.exports = function(benchmarkRunner){

  this.runner = new benchmarkRunner.Suite;

  this.emitError = function(error){
    this.runner.emit('error', error);
  };

  this.onError = function(callback){
    this.runner.on('error', function(event, error){
      callback(error);
    });
  };

  this.onComplete = function(callback){
    this.runner.on('complete', function() {
      this.fasterName = this.filter('fastest').pluck('name');
      callback(this);
    });
  };

  this.onCycle = function(callback){
    this.runner.on('cycle', function(event) {
      callback(event);
    });
  };

  this.add = function(suiteName, options, callback){
    this.runner.add(suiteName, function(deferred){
      callback(function(){
        deferred.resolve();
      });
    }, _.extend(options, { defer: true }));
  };

  this.run = function(){
    this.runner.run({ async: true });
  };

  return this;
};