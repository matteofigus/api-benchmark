'use strict';

module.exports = function(){
  this.time = 0;
  this.nanoseconds = process && process.hrtime;

  this.get = function(){
    if(this.nanoseconds){
      var now = process.hrtime(this.startTime);
      return now[0] + now[1] / 1e9;
    } else {
			return (new Date() - this.startTime) / 1000;
		}
  };

  this.start = function(){
    this.startTime = this.nanoseconds ? process.hrtime() : new Date();
  };

  this.stop = function(){
    this.time += this.get();
  };
};
