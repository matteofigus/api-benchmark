var Runner = require('./runner');
var _ = require('underscore');

module.exports = function(options){

  this.runner = new Runner(options);

  return _.extend(this, {
    emitError: function(error){
      this.runner.emit('error', error);
    },
    onComplete: function(callback){
      this.runner.on('complete', callback);
    },
    onCycle: function(callback){
      this.runner.on('cycle', callback);
    },
    onError: function(callback){
      this.runner.on('error', callback);
    },
    add: function(suiteName, href, callback){
      this.runner.add(suiteName, href, function(done){
        callback(done);
      });
    },
    run: function(){
      this.runner.run();
    }
  });
};