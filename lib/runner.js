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
      },
      errors: {}
    };

    step.run = function(callback){

      var isSequence = !self.options.runMode || self.options.runMode == 'sequence',
          maxConcurrent = isSequence ? 1 : self.options.maxConcurrentRequests,
          totalRequests = self.options.minSamples,
          cycleLength = (maxConcurrent && totalRequests > maxConcurrent) ? maxConcurrent : totalRequests,
          cycleDelay = isSequence ? self.options.delay : 0;
          callbackDone = false,
          globalTimer = new Timer(),
          sampled = 0,
          i = 0;

      var runNextSample = function(){
        if(isSequence)
          globalTimer.start();
        self.runSample(step.func, sampleDone, i);
        i++;
      };

      var sampleDone = function(sample, pos, err){

        var currentGlobalTime = self.getCurrentTime(globalTimer, isSequence),
            maxTime = self.options.maxTime;

        step.stats.sample[pos] = sample; 
        sampled++;

        if(err){
          if(!step.errors[err.code])
            step.errors[err.code] = [];

          step.errors[err.code].push(_.extend(err, {
            pos: pos
          }));

          self.emit('error', _.extend(err, {
            details: step.href + ' (' + pos + ')'
          }));    
        }

        if(!callbackDone && totalRequests > i && currentGlobalTime < maxTime){
          if(cycleDelay > 0)
            setTimeout(runNextSample, cycleDelay);
          else
            runNextSample();
        } else if(!callbackDone && (sampled == totalRequests || currentGlobalTime >= maxTime)) {
          callbackDone = true;
          callback(self.addResult(step));
        }
      };

      globalTimer.start();

      for(i = 0; i < cycleLength; i++)
        (self.runSample)(step.func, sampleDone, i);

    };
    this.steps.push(step);
  };

  this.runSample = function(func, c, i){
    var timer = new Timer();
    timer.start();
    func(function(err, success){
      c(timer.get(), i, err);
    });
  };

  this.getCurrentTime = function(timer, isSequence){
    if(isSequence){
      timer.stop();
      return timer.time;
    }
    return timer.get();
  };

  this.addResult = function(step){
    step.stats.sample = _.filter(step.stats.sample, function(item){
      return _.isNumber(item);
    });
    var result = benchmarkUtils.getRelevantFields(_.pick(step, 'name', 'href', 'stats', 'errors'));
    this.results.push(result);
    this.emit('cycle', benchmarkUtils.cycleMessage(result));
    return step;
  };

  this.run = function(){
    var self = this;

    giveMe.sequence(_.map(this.steps, function(step){ return _.bind(step.run, step); }), function(callbacks){

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