var requestHandler = require('./../../lib/request-handler');

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
        aProperty: "value"
      },
      runner: {
        add: function(suiteName, suiteHref, callback){
          callback();
        }
      }
    };

    requestHandler.setup("suiteName", "suiteHref", suiteObj, fakeAgent);

    var req = fakeAgentStack[0][0];

    req.url.should.be.eql("suiteHref");
    req.aProperty.should.be.eql("value");

    done();
  });
});

describe('requestHandler.make function', function(){

  it('should respond with an error in case of wrong response code', function(done){

    var fakeAgent = {
      make: function(req, callback){
        callback({ status: 200 });
      }
    };

    requestHandler.make({}, { endpoint: { expectedStatusCode: 400 }}, "suiteName", fakeAgent, function(err, success){
      success.should.be.eql(false);
      err.type.should.be.eql("httpStatusCodeNotMatching");
      done();
    });

  });
})