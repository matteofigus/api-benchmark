var benchmarkUtils = require('./../../lib/benchmark-utils');
var should = require('should');

describe('sort function', function(){

  it('should correctly sort multiple results by mean + moe', function(done) {

    var sorted = benchmarkUtils.sort([
      { name: "Slow server", stats: { moe: 3, mean: 3 }},
      { name: "Fast server", stats: { moe: 1, mean: 1 }},
      { name: "Medium server", stats: { moe: 2, mean: 2 }}
    ]);

    sorted[0].name.should.be.eql("Fast server");
    sorted[sorted.length - 1].name.should.be.eql("Slow server");

    done();
  });
});

describe('getSuccessful function', function(){

  it('should correctly filter results with 0 cycles', function(done) {

    benchmarkUtils.getSuccessful([{ cycles: 0 }, { cycles: null }]).length.should.be.eql(0);
    done();
  });

  it('should correctly filter results with infinite hz', function(done) {

    benchmarkUtils.getSuccessful([{ hz: Infinity }, { hz: -Infinity }]).length.should.be.eql(0);
    done();
  });
});

describe('getBenchmarkAverage function', function(){

  it('should correctly calculate the average of all the numeric values', function(done) {

    var average = benchmarkUtils.getBenchmarkAverage({
      "serverName": {
        route1: {
          name: "serverName/route1",
          stats: { moe: 1, rme: 1, deviation: 1, variance: 1, mean: 1, sem: 1 },
          cycles: 1,
          hz: 1
        },
        route2: {
          name: "serverName/route2",
          stats: { moe: 3, rme: 3, deviation: 3, variance: 3, mean: 3, sem: 3 },
          cycles: 3,
          hz: 3
        }
      }
    }, "serverName");

    average.should.be.eql({
      name: "serverName",
      stats: { moe: 2, rme: 2, deviation: 2, variance: 2, mean: 2, sem: 2 },
      cycles: 2,
      hz: 2
    });

    done();
  });
});