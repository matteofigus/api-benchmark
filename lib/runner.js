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
      if(self.options.runMode && self.options.runMode == 'parallel'){
        
        var funcs = [],
            timer = new Timer();

        for(var i = 0; i < self.options.minSamples; i++)
          funcs.push([step.func]);

        var runSample = function(func, c){
          func(function(){
            c(timer.get());
          });
        };

        timer.start();
        giveMe.all(runSample, funcs, function(callbacks){
          step.stats.sample = _.map(callbacks, function(icallback){
            return icallback[0];
          });
          var result = benchmarkUtils.getRelevantFields(_.pick(step, 'name', 'href', 'stats'));
          self.results.push(result);
          self.emit('cycle', benchmarkUtils.cycleMessage(result));
          callback(step);
        });

      } else {
        
        var globalTimer = new Timer();

        var wantMore = function(){
          return (globalTimer.time < self.options.maxTime &&
                  step.stats.sample.length < self.options.minSamples);
        };

        var runSample = function(step){
          var stepTimer = new Timer();
          stepTimer.start();
          globalTimer.start();

          step.func(function(){
            stepTimer.stop();
            globalTimer.stop();
            step.stats.sample.push(stepTimer.time);
            if(wantMore()){
              setTimeout(function() {
                runSample(step);
              }, self.options.delay);
            }
            else {
              var result = benchmarkUtils.getRelevantFields(_.pick(step, 'name', 'href', 'stats'));
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