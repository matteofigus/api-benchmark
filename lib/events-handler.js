var _ = require('underscore');

module.exports = function(){
  // home-made events handling, simple, better than fighting with the various node implementations?

  this.listeners = {};

  this.on = function(eventName, listener){
    if(!this.listeners[eventName])
      this.listeners[eventName] = [];

    this.listeners[eventName].push(listener);
  };

  this.emit = function(eventName, args){
    if(this.listeners[eventName])
      _.forEach(this.listeners[eventName], function(listener){
        listener.apply(this, _.isArray(args) ? args : [args]);
      });
  };
}