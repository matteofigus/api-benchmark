var benchmarkUtils = require('./benchmark-utils');
var giveMe = require('give-me');
var Timer = require('./timer.js');
var _ = require('underscore');

module.exports = function(options){

  this.steps = [];
  this.results = [];
  this.options = options;
  this.listeners = {};

  this.on = function(eventName, listener){
    if(!this.listeners[eventName])
      this.listeners[eventName] = [];

    this.listeners[eventName].push(listener);
  };

  this.emit = function(eventName, args){
    if(!_.isArray(args))
      args = [args];
    if(this.listeners[eventName])
      _.forEach(this.listeners[eventName], function(listener){
        listener.apply(this, args);
      });
  };

  this.add = function(stepName, href, func){
    var self = this;

    var step = {
      name: stepName,
      func: func,
      href: href,
      samples: []
    };

    step.run = function(callback){
      if(!self.options.runMode || self.options.runMode == 'sequence'){
        
        var globalTimer = new Timer();
        globalTimer.start();

        var wantMore = function(){
          return (self.options.maxTime > globalTimer.get() || step.samples.length < self.options.minSamples);
        };

        var runSample = function(step){
          var stepTimer = new Timer();
          stepTimer.start();

          step.func(function(){
            stepTimer.stop();
            step.samples.push(stepTimer.time);
            if(wantMore())
              runSample(step);
            else {
              result = benchmarkUtils.getRelevantFields({
                name: step.name,
                href: step.href,
                stats: {
                  sample: step.samples
                }
              });
              self.results.push(result);
              self.emit('cycle', benchmarkUtils.cycleMessage(result));
              callback(step);
            }
          });
        };
        runSample(step);
      }
    };
    this.steps.push(step);
  };

  this.run = function(){
    var self = this;

    giveMe.sequence(_.map(this.steps, function(step){ return step.run; }), function(callbacks){

      var results = {};

      _.forEach(self.results, function(result, i){
        results[i] = result;
      });

      var sorted = _.compose(benchmarkUtils.sort, benchmarkUtils.getSuccessful)(results)

      if(sorted.length > 1){
        _.find(results, function(result){ return result.name == sorted[0].name}).isFastest = true;
        _.find(results, function(result){ return result.name == sorted[sorted.length - 1].name}).isSlowest = true;
      }

      self.emit('complete', results);
    });
  };
};