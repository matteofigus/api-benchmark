var BenchmarkRunnerHandler = require('./../../lib/benchmark-runner-handler');

describe('BenchmarkRunnerHandler class', function(){
  
  var emitStack = {};

  var fakeBenchmarkRunner = {
    Suite: function(){
      this.emit = function(key, value){
        if(!emitStack[key])
          emitStack[key] = [];
        emitStack[key].push(value);
      };
    }
  };

  it('should emit errors via the emitError', function(done){
    
    emitStack = {};

    var benchmarkRunnerHandler = new BenchmarkRunnerHandler(fakeBenchmarkRunner);
    benchmarkRunnerHandler.emitError('the error details');
    emitStack['error'][0].should.be.eql('the error details');
    
    done();
  });
})