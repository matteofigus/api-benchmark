'use strict';

var should = require('should');
var Timer = require('./../../lib/timer');

describe('Timer class', function(){

  it('should correctly perform a time count', function(done){
    var timer = new Timer();

    timer.start();
    setTimeout(function() {
      timer.stop();
      timer.time.should.be.within(0.09, 0.12);
      done();
    }, 100);
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
          timer.time.should.be.within(0.19, 0.22);
          done();
        }, 100);
      }, 100);
    }, 100);
  });
});
