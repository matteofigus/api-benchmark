'use strict';

var injectr = require('injectr');
var should = require('should');

describe('Timer class', function(){

  var Timer = injectr('./../../lib/timer.js', {}, {
    process: {
      hrtime: function(start){
        return start ? [10, 0] : [235389, 949793216];
      }
    }
  });

  it('should correctly perform a time count', function(){
    var timer = new Timer();

    // Process.hrtime is mocked to return a 10 seconds timer
    timer.start();
    timer.stop();

    timer.time.should.be.eql(10);
  });

  it('should correctly perform a stop + restart action', function(){
    var timer = new Timer();

    // Process.hrtime is mocked to return a 10 seconds timer
    timer.start();
    timer.stop();

    // Process.hrtime is mocked to return a 10 seconds timer
    timer.start();
    timer.stop();

    timer.time.should.be.eql(20);
  });
});
