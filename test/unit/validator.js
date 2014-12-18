'use strict';

var should = require('should');
var validator = require('./../../lib/validator');

var endpoints = { simpleRoute: '/getJson', secondaryRoute: '/getJson2' };
var servers = {
  'Slow server': 'http://localhost:3006',
  'Fast server': 'http://localhost:3007'
};

describe('Validator.checkEndpoints function', function(){

  it('should correctly return an error if the endpoints parameter is null', function(done){
    var result = validator.checkEndpoints(null);
    result.should.be.eql('Endpoints argument is not valid');
    done();
  });

  it('should correctly return an error if the endpoints parameter is not an object', function(done){
    var result = validator.checkEndpoints([]);
    result.should.be.eql('Endpoints argument is not valid');
    done();
  });

  it('should correctly return an error if the endpoints parameter is an empty object', function(done){
    var result = validator.checkEndpoints({});
    result.should.be.eql('Endpoints argument is not valid');
    done();
  });

  it('should correctly return an error if the endpoints parameter contains an unsupported verb', function(done){
    var result = validator.checkEndpoints({ routeName: { route: '/route', method: 'unsupported' }});
    result.should.be.eql('Endpoints argument is not valid - found an unsupported http verb');
    done();
  });

});

describe('Validator.checkServices function', function(){

  it('should correctly return an error if the services parameter is null', function(done){
    var result = validator.checkServices(null);
    result.should.be.eql('Services argument is not valid');
    done();
  });

  it('should correctly return an error if the services parameter is not an object', function(done){
    var result = validator.checkServices([]);
    result.should.be.eql('Services argument is not valid');
    done();
  });

  it('should correctly return an error if the services parameter is an empty object', function(done){
    var result = validator.checkServices({});
    result.should.be.eql('Services argument is not valid');
    done();
  });

});

describe('Validator.checkCallback function', function(){

  it('should correctly raise exception if the callback parameter is null', function(done){
    (function(){
      validator.checkCallback(null);
    }).should.throw('Callback argument is not valid');
    done();
  });

  it('should correctly raise exception if the callback parameter is not a function', function(done){
    (function(){
      validator.checkCallback([]);
    }).should.throw('Callback argument is not valid');
    done();
  });

  it('should correctly raise exception if the callback parameter is an object', function(done){
    (function(){
      validator.checkCallback({});
    }).should.throw('Callback argument is not valid');
    done();
  });
});
