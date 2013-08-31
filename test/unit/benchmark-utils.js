var benchmarkUtils = require('./../../lib/benchmark-utils');
var should = require('should');
var testData = require('./../utils/test-data');

describe('sort function', function(){

  it('should correctly sort multiple results by mean + moe', function(done) {

    var testAveragesArray = testData.getAveragesArray({ 
      'Slow server': { numericValues: 3 }, 
      'Medium-slow server': { numericValues: 2 },
      'Fast server': { numericValues: 1 }
    });
    
    var sorted = benchmarkUtils.sort(testAveragesArray);

    sorted[0].name.should.be.eql("Fast server");
    sorted[sorted.length - 1].name.should.be.eql("Slow server");

    done();
  });
});

describe('getSuccessful function', function(){

  it('should correctly filter results with 0 cycles', function(done) {

    var testAveragesArray = testData.getAveragesArray({ 
      server1: { numericValues: 0 }, 
      server2: { numericValues: null }
    });
    
    benchmarkUtils.getSuccessful(testAveragesArray).length.should.be.eql(0);
    done();
  });

  it('should correctly filter results with infinite hz', function(done) {

    var testAveragesArray = testData.getAveragesArray({ 
      server1: { numericValues: Infinity }, 
      server2: { numericValues: -Infinity }
    });

    benchmarkUtils.getSuccessful(testData).length.should.be.eql(0);
    done();
  });
});

describe('getBenchmarkAverage function', function(){

  it('should correctly calculate the average of all the numeric values', function(done) {

    var testServerResults = testData.getServerResults("serverName", { 
      route1: { numericValues: 1 }, 
      route2: { numericValues: 3 }
    });

    var average = benchmarkUtils.getBenchmarkAverage(testServerResults, "serverName");

    average.should.be.eql({
      name: "serverName",
      stats: { moe: 2, rme: 2, deviation: 2, variance: 2, mean: 2, sem: 2 },
      cycles: 2,
      hz: 2
    });

    done();
  });
});

describe('geAverage function', function(){

  it('should correctly calculate the average of all the numeric values for multiple server', function(done) {

    var testServersResults = testData.getServersResults([
      { name: "serverName1", routes: { route1: { numericValues: 1}, route2: { numericValues: 3 }}},
      { name: "serverName2", routes: { route1: { numericValues: 2}, route2: { numericValues: 4 }}}
    ]);

    var sortedAverages = benchmarkUtils.getAverage(testServersResults);

    sortedAverages[0].should.be.eql({
      name: "serverName1",
      stats: { moe: 2, rme: 2, deviation: 2, variance: 2, mean: 2, sem: 2 },
      cycles: 2,
      hz: 2
    });

    done();
  });
});