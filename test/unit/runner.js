var Runner = require('./../../lib/runner');
var sanitise = require('./../../lib/sanitise');
var Timer = require('./../../lib/timer');

describe('Runner.run in sequence', function(){

  it('should be able to run a series of 5 benchmarks if maxTime is enough', function(done){

    var options = sanitise.options({ minSamples: 5, runMode: 'sequence', maxTime: 10 }),
        runner = new Runner(options);

    runner.add('step', 'http://www.google.com', function(callback){
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

    runner.add('step', 'http://www.google.com', function(callback){
      setTimeout(function() {
        callback();
      }, 10);
    });

    runner.on('complete', function(results){
      results[0].stats.sample.length.should.be.below(11);
      done();
    });

    runner.run();
  });

  it('should be able to run a series of benchmarks with a delay time if needed, without and the maxTime calculation should ignore delays', function(done){

    var options = sanitise.options({ minSamples: 50, runMode: 'sequence', delay: 10, maxTime: 0.1 }),
        runner = new Runner(options),
        timer = new Timer();

    runner.add('step', 'http://www.google.com', function(callback){
      setTimeout(function() {
        callback();
      }, 10);
    });

    runner.on('complete', function(results){
      timer.stop();
      results[0].stats.sample.length.should.be.within(9,11);
      timer.time.should.be.within(0.185, 0.215);
      done();
    });

    timer.start();
    runner.run();
  });
});