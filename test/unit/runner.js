'use strict';

var Runner = require('./../../lib/runner');
var sanitise = require('./../../lib/sanitise');
var should = require('should');
var Timer = require('./../../lib/timer');
var _ = require('underscore');

describe('Runner.run in sequence', function(){

  it('should be able to run a series of 5 benchmarks if maxTime is enough', function(done){

    var options = sanitise.options({ minSamples: 5, runMode: 'sequence', maxTime: 10 }),
        runner = new Runner(options);

    runner.add('step', 'http://www.google.com', {}, {}, function(callback){
      setTimeout(function() {
        callback();
      }, 10);
    });

    runner.on('complete', function(results){
      results[0].stats.sample.length.should.be.eql(5);
      done();
    });

    runner.run();
  });

  it('should be able to run a series of benchmarks for a maximum time if the option is set', function(done){

    var options = sanitise.options({ minSamples: 500, runMode: 'sequence', maxTime: 0.1 }),
        runner = new Runner(options);

    runner.add('step', 'http://www.google.com', {}, {}, function(callback){
      setTimeout(function() {
        callback();
      }, 10);
    });

    runner.on('complete', function(results){
      results[0].stats.sample.length.should.be.below(12);
      done();
    });

    runner.run();
  });

  it('should be able to run a series of benchmarks with a delay time if needed, and the maxTime calculation should ignore delays', function(done){

    var options = sanitise.options({ minSamples: 50, runMode: 'sequence', delay: 10, maxTime: 0.1 }),
        runner = new Runner(options),
        timer = new Timer();

    runner.add('step', 'http://www.google.com', {}, {}, function(callback){
      setTimeout(function() {
        callback();
      }, 10);
    });

    runner.on('complete', function(results){
      timer.stop();
      results[0].stats.sample.length.should.be.below(12);
      timer.time.should.be.within(0.18, 0.3);
      done();
    });

    timer.start();
    runner.run();
  });
});

describe('Runner.run in parallel', function(){

  it('should be able to run a series of 100 benchmarks in parallel in a decent amount of time', function(done){

    var options = sanitise.options({ minSamples: 100, runMode: 'parallel' }),
        runner = new Runner(options),
        timer = new Timer();

    runner.add('step', 'http://www.google.com', {}, {}, function(callback){
      setTimeout(function() {
        callback();
      }, 10);
    });

    runner.on('complete', function(results){
      timer.stop();
      results[0].stats.sample.length.should.be.eql(100);
      timer.time.should.be.within(0.01, 1);
      done();
    });

    timer.start();
    runner.run();
  });

  it('should be able to run a series of 500 benchmarks in parallel with a maxConcurrentRequests parameter', function(done){

    var options = sanitise.options({ minSamples: 500, maxConcurrentRequests: 50, runMode: 'parallel' }),
        runner = new Runner(options),
        timer = new Timer();

    runner.add('step', 'http://www.google.com', {}, {}, function(callback){
      setTimeout(function() {
        callback();
      }, 10);
    });

    runner.on('complete', function(results){
      timer.stop();
      results[0].stats.sample.length.should.be.eql(500);
      timer.time.should.be.within(0.1, 1);
      done();
    });

    timer.start();
    runner.run();
  });

  it('should be able to run a series of benchmarks in parallel with a maxConcurrentRequests parameter in a maxTime', function(done){

    var options = sanitise.options({ minSamples: 1000, maxConcurrentRequests: 50, maxTime: 0.15, runMode: 'parallel' }),
        runner = new Runner(options);

    runner.add('step', 'http://www.google.com', {}, {}, function(callback){
      setTimeout(function() {
        callback();
      }, 100);
    });

    runner.on('complete', function(results){
      results[0].stats.sample.length.should.be.within(50, 100);
      done();
    });

    runner.run();
  });

  it('should be able to write benchmark times in the same order they have been called', function(done){

    var options = sanitise.options({ minSamples: 5, maxConcurrentRequests: 50, maxTime: 0.50, runMode: 'parallel' }),
        runner = new Runner(options);

    var results = [10, 30, 50, 30, 10];

    runner.add('step', 'http://www.google.com', {}, {}, function(callback){
      setTimeout(function() {
        callback();
      }, results.pop());
    });

    runner.on('complete', function(results){
      var samples = results[0].stats.sample;
      samples[0].should.be.below(samples[1]);
      samples[1].should.be.below(samples[2]);
      samples[2].should.be.above(samples[3]);
      samples[3].should.be.above(samples[4]);
      done();
    });

    runner.run();
  });
});

describe('Runner.addResult', function(){
  it('should remove null values from step.stats', function(done){
    var runner = new Runner();
    var step = {
      name: 'name',
      href: 'href',
      stats: {
        sample: []
      },
      options: {}
    };

    step.stats.sample.push(123);
    step.stats.sample[3] = 456;
    step.stats.sample[5] = 0;

    var newStep = runner.addResult(step);

    newStep.stats.sample.length.should.be.eql(3);
    newStep.stats.sample[0].should.be.eql(123);
    newStep.stats.sample[1].should.be.eql(456);
    newStep.stats.sample[2].should.be.eql(0);
    done();
  });

  it('should clean the step object from not relevant properties and add it to results', function(done){
    var runner = new Runner();
    var step = {
      name: 'name',
      'notRelevant': 'someValue',
      'stats': {},
      href: 'hello',
      options: { hello: 'world' }
    };

    var newStep = runner.addResult(step);

    runner.results[0].name.should.be.eql('name');
    _.has(runner.results[0], 'notRelevant').should.be.eql(false);
    runner.results[0].options.should.be.eql({ hello: 'world'});
    done();
  });
});
