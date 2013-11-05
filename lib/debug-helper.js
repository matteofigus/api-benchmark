module.exports = function(caller, logger){

  this.caller = caller;

  var logger = logger || console,
      self = this;
  
  this.log = function(message){
    logger.log('======================================');
    logger.log(message);
    logger.log('');
  };

  this.logComparisonResult = function(message){
    if(self.caller == 'compare')
      self.log(message);
  };

  this.simpleLog = logger.log;

};