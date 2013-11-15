var apiBenchmark = require('./../../lib/api-benchmark');

describe('apiBenchmark module', function(){

  it('should provide measure function', function(done){
    apiBenchmark.measure.should.be.type('function');
    done();
  })

  it('should provide compare function', function(done){
    apiBenchmark.compare.should.be.type('function');
    done();
  });
});