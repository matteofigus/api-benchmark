var RequestHandler = require('./../../lib/request-handler');
var should = require('should');
var testAgent = require('./../fixtures/test-agent');

describe('requestHandler.make function', function(){

  var requestHandler = new RequestHandler(new testAgent.FakeAgent());

  it('should correctly handle null data', function(done){
      requestHandler.make({ 
        route: '/post',
        method: 'post',
        data: null
      }, function(fakeResults){
        fakeResults.data.should.be.eql({});
        done();
      });
  });

  it('should correctly handle undefined data', function(done){
      requestHandler.make({ 
        route: '/post',
        method: 'post',
        data: undefined
      }, function(fakeResults){
        fakeResults.data.should.be.eql({});
        done();
      });
  });

  it('should correctly handle cookies', function(done){
      requestHandler.make({ 
        route: '/get',
        method: 'get',
        headers: {
          'Cookie': 'hello=world'
        }
      }, function(fakeResults){
        fakeResults.headers.should.be.eql({ Cookie: 'hello=world'});
        done();
      });
  });

  it('should correctly handle headers', function(done){
      requestHandler.make({ 
        route: '/get',
        method: 'get',
        headers: {
          'Cookie': 'cookieName=value',
          'Accept': 'application/json'
        }
      }, function(fakeResults){
        fakeResults.headers.Accept.should.be.eql('application/json');
        fakeResults.headers.Cookie.should.be.eql('cookieName=value');
        done();
      });
  });

});