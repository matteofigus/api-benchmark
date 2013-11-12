var _ = require('underscore');

module.exports = function(caller, logger){

  this.caller = caller;
  this.enabled = true;

  var logger = logger || console,
      self = this;

  return _.extend(this, {
    shutUp: function(){
      this.enabled = false;
    },
    log: function(message){
      if(!this.enabled)
        return this;

      logger.log('======================================');
      logger.log(message);
      logger.log('');
    },
    logComparisonResult: function(message){
      if(!this.enabled)
        return this;

      if(self.caller == 'compare')
        self.log(message);
    },
    simpleLog: function(message){

      if(!this.enabled)
        return this;

      logger.log(message);
    }
  });
};