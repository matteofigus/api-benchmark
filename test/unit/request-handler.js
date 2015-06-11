'use strict';

var requestHandler = require('./../../lib/request-handler');
var should = require('should');

describe('requestHandler.setup function', function(){

  it('should create a valid req object', function(done){

    var fakeAgentStack = [];

    var fakeAgent = {
      make: function(){
        fakeAgentStack.push(arguments);
      }
    };

    var suiteObj = {
      endpoint: {
        aProperty: 'value'
      },
      runner: {
        add: function(suiteName, suiteHref, suiteOptions, suiteRequest, callback){
          callback();
        }
      }
    };

    requestHandler.setup('suiteName', 'suiteHref', suiteObj, fakeAgent);

    var req = fakeAgentStack[0][0];

    req.url.should.be.eql('suiteHref');
    req.aProperty.should.be.eql('value');

    done();
  });
});

describe('requestHandler.make function', function(){

  it('should respond with a httpStatusCodeNotMatching error in case of wrong response code', function(done){

    var fakeAgent = {
      make: function(req, callback){
        callback(null, {
          statusCode: 200,
          header: '',
          text: 'hello world',
          type: 'text/plain'
        });
      }
    };

    requestHandler.make({}, { endpoint: { expectedStatusCode: 400 }}, 'suiteName', fakeAgent, function(err, res){
      res.should.be.eql({
        statusCode: 200,
        header: '',
        body: 'hello world',
        type: 'text/plain'
      });
      err.code.should.be.eql('httpStatusCodeNotMatching');
      done();
    });
  });

  it('should respond with a ECONNREFUSED error in case of connection error', function(done){

    var fakeAgent = {
      make: function(req, callback){
        callback({
          code: 'ECONNREFUSED',
          message: 'connect ECONNREFUSED'
        }, null);
      }
    };

    requestHandler.make({}, { endpoint: { expectedStatusCode: 400 }}, 'suiteName', fakeAgent, function(err, res){
      res.should.be.eql(false);
      err.code.should.be.eql('ECONNREFUSED');
      done();
    });
  });

});
