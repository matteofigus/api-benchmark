'use strict';

var RequestAgent = require('./../../lib/request-agent');
var should = require('should');
var testAgent = require('./../fixtures/test-agent');
var _ = require('underscore');

describe('requestAgent.make function', function(){

  var requestAgent;

  beforeEach(function(done){
    var fakeAgent = new testAgent.FakeAgent();
    requestAgent = new RequestAgent(fakeAgent);
    fakeAgent.headers = {};
    done();
  });

  it('should correctly handle null data', function(done){
      requestAgent.make({
        service: 'http://service/',
        route: '/post',
        method: 'post',
        data: null
      }, function(err, fakeResults){
        _.isUndefined(fakeResults.data).should.be.eql(true);
        done();
      });
  });

  it('should correctly handle undefined data', function(done){
      requestAgent.make({
        service: 'http://service/',
        route: '/post',
        method: 'post',
        data: undefined
      }, function(err, fakeResults){
        _.isUndefined(fakeResults.data).should.be.eql(true);
        done();
      });
  });

  it('should correctly handle route as a function', function(done){

    var i = 0;

    var routeFunc = function(){
      i++;
      return '/endpoint'+i;
    };

    var request = {
      service: 'http://service/',
      route: routeFunc,
      method: 'post'
    };

    requestAgent.make(request, function(err, fakeResults){
      fakeResults.url.should.be.eql('http://service/endpoint1');
      requestAgent.make(request, function(err, fakeResults){
        fakeResults.url.should.be.eql('http://service/endpoint2');
        done();
      });
    });
  });

  it('should correctly handle data as a function', function(done){

    var i = 0;

    var dataFunc = function(){
      i++;
      return { c: i };
    };

    var request = {
      service: 'http://service/',
      route: '/post',
      method: 'post',
      data: dataFunc
    };

    requestAgent.make(request, function(err, fakeResults){
      fakeResults.data.should.be.eql({c: 1});
      requestAgent.make(request, function(err, fakeResults){
        fakeResults.data.should.be.eql({c: 2});
        done();
      });
    });
  });

  it('should correctly handle query as a function', function(done){

    var i = 0;

    var queryFunc = function(){
      i++;
      return { c: i };
    };

    var request = {
      service: 'http://service/',
      route: '/get',
      method: 'get',
      query: queryFunc
    };

    requestAgent.make(request, function(err, fakeResults){
      fakeResults.query.should.be.eql({c: 1});
      requestAgent.make(request, function(err, fakeResults){
        fakeResults.query.should.be.eql({c: 2});
        done();
      });
    });
  });

  it('should correctly handle cookies', function(done){
      requestAgent.make({
        service: 'http://service/',
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
        service: 'http://service/',
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

  it('should correctly handle headers as a function', function(done){

    var i = 0;

    var headersFunc = function(){
      i++;
      return { c: i };
    };

    var request = {
      service: 'http://service/',
      route: '/get',
      method: 'get',
      headers: headersFunc
    };

    requestAgent.make(request, function(err, fakeResults){
      fakeResults.headers.should.be.eql({c: 1});
      requestAgent.make(request, function(err, fakeResults){
        fakeResults.headers.should.be.eql({c: 2});
        done();
      });
    });
  });

});
