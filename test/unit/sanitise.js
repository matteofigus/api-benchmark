'use strict';

var sanitise = require('./../../lib/sanitise');
var should = require('should');

describe('sanitise.endpoint function', function(){

  it('should create an object from a string', function(done){
    var sanitised = sanitise.endpoint('endpointName', 'this is a string');
    sanitised.route.should.be.eql('this is a string');
    done();
  });

  it('should add get as default verb if not specified', function(done){
    var sanitised = sanitise.endpoint('endpointName', 'this is a string');
    sanitised.method.should.be.eql('get');
    done();
  });

});

describe('sanitise.initialInput function', function(){

  it('should correctly handle the fact that options is an optional parameter', function(done){
    var sanitised = sanitise.initialInput({
      thisIs: 'an object representing the services'
    },{
      thisIs: 'an object representing the endpoints'
    },
    function(){
      return 'this is the callback';
    });

    sanitised.options.should.be.eql({});
    sanitised.callback.should.be.type('function');
    sanitised.callback().should.be.eql('this is the callback');
    done();
  });
});

describe('sanitise.options', function(){

  it('should correctly initiate options in case of blank parameter', function(done){
    var sanitised = sanitise.options(null);
    sanitised.should.be.type('object');
    sanitised.delay.should.be.eql(0);
    sanitised.runMode.should.be.eql('sequence');
    sanitised.maxConcurrentRequests.should.be.eql(100);
    sanitised.minSamples.should.be.eql(20);
    sanitised.maxTime.should.be.eql(10);
    sanitised.stopOnError.should.be.eql(true);
    done();
  });
});
