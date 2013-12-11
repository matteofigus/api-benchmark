var Runner = require('./../../lib/runner');

describe('Runner.run in sequence', function(){

  it('should be able to run a series of 5 benchmarks if maxTime is enough', function(done){

    var runner = new Runner({ minSamples: 5, runMode: 'sequence', maxTime: 10 });

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

    var runner = new Runner({ minSamples: 500, runMode: 'sequence', maxTime: 0.1 });

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
});