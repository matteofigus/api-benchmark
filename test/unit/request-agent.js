var RequestAgent = require('./../../lib/request-agent');
var should = require('should');
var testAgent = require('./../fixtures/test-agent');

describe('requestAgent.make function', function(){

  var requestAgent = new RequestAgent(new testAgent.FakeAgent());

  it('should correctly handle null data', function(done){
      requestAgent.make({ 
        route: '/post',
        method: 'post',
        data: null
      }, function(err, fakeResults){
        fakeResults.data.should.be.eql({});
        done();
      });
  });

  it('should correctly handle undefined data', function(done){
      requestAgent.make({ 
        route: '/post',
        method: 'post',
        data: undefined
      }, function(err, fakeResults){
        fakeResults.data.should.be.eql({});
        done();
      });
  });

  it('should correctly handle cookies', function(done){
      requestAgent.make({ 
        route: '/get',
        method: 'get',
        headers: {
          'Cookie': 'hello=world'
        }
      }, function(err, fakeResults){
        fakeResults.headers.should.be.eql({ Cookie: 'hello=world'});
        done();
      });
  });

  it('should correctly handle headers', function(done){
      requestAgent.make({ 
        route: '/get',
        method: 'get',
        headers: {
          'Cookie': 'cookieName=value',
          'Accept': 'application/json'
        }
      }, function(err, fakeResults){
        fakeResults.headers.Accept.should.be.eql('application/json');
        fakeResults.headers.Cookie.should.be.eql('cookieName=value');
        done();
      });
  });

});