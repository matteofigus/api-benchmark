'use strict';

var should = require('should');
var Timer = require('./../../lib/timer');

describe('Timer class', function(){

  it('should correctly perform a time count', function(done){
    var timer = new Timer();

    timer.start();
    setTimeout(function() {
      timer.stop();
      timer.time.should.be.within(0.009, 0.018);
      done();
    }, 10);
  });

  it('should correctly perform a stop + restart action', function(done){
    var timer = new Timer();

    timer.start();
    setTimeout(function() {
      timer.stop();
      setTimeout(function() {
        timer.start();
        setTimeout(function() {
          timer.stop();
          timer.time.should.be.within(0.019, 0.029);
          done();
        }, 10);
      }, 10);
    }, 10);
  });
});
