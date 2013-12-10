var EventsHandler = require('./../../lib/events-handler');
var _ = require('underscore');

describe('eventsHandler.emit', function(){

  it('should emit events and on eventsHandler.on should set the listener', function(done){

    var callsStack = [],
        callsStack2 = []
        e = new EventsHandler();
    
    e.on('eventName', function(param){
      setTimeout(function() {
        callsStack.push(param);
      }, 10);
    });

    e.on('eventName', function(param){
      setTimeout(function() {
        callsStack2.push(param);
        callsStack2.push(param);
      }, 15);
    });

    e.emit('eventName', 'someParameter');

    setTimeout(function() {
      callsStack.length.should.be.eql(1);
      callsStack2.length.should.be.eql(2);
      callsStack[0].should.be.eql('someParameter');
      done();
    }, 20);
  });

  it('should be used to extend another class', function(done){
    
    var callsStack = [];

    var f = function(){
      return _.extend(this, new EventsHandler());
    };

    var f_istance = new f();

    f_istance.on('eventName', function(param){
      callsStack.push(param);
    });

    f_istance.emit('eventName', 'hello world');

    setTimeout(function() {
      callsStack.length.should.be.eql(1);
      callsStack[0].should.be.eql('hello world');
      done();
    }, 10);
  });
});