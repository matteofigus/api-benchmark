var benchmarkUtils = require('./benchmark-utils');
var EventsHandler = require('./events-handler');
var giveMe = require('give-me');
var Timer = require('./timer.js');
var _ = require('underscore');

module.exports = function(options){

  this.steps = [];
  this.results = [];
  this.options = options;

  this.add = function(stepName, href, func){
    var self = this;

    var step = {
      name: stepName,
      func: func,
      href: href,
      stats: {
        sample: []
      }
    };

    step.run = function(callback){
      if(!self.options.runMode || self.options.runMode == 'sequence'){
        
        var globalTimer = new Timer();
        globalTimer.start();

        var wantMore = function(){
          return (self.options.maxTime > globalTimer.get() || step.stats.sample.length < self.options.minSamples);
        };

        var runSample = function(step){
          var stepTimer = new Timer();
          stepTimer.start();

          step.func(function(){
            stepTimer.stop();
            step.stats.sample.push(stepTimer.time);
            if(wantMore())
              runSample(step);
            else {
              result = benchmarkUtils.getRelevantFields(_.pick(step, 'name', 'href', 'stats'));
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
      _.forEach(self.results, function(result, i){ results[i] = result; });

      var sorted = _.compose(benchmarkUtils.sort, benchmarkUtils.getSuccessful)(results);

      if(sorted.length > 1){
        _.find(results, function(result){ return result.name == sorted[0].name}).isFastest = true;
        _.find(results, function(result){ return result.name == sorted[sorted.length - 1].name}).isSlowest = true;
      }

      self.emit('complete', results);
    });
  };

  return _.extend(this, new EventsHandler());
};