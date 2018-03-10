'use strict';

module.exports.FakeAgent = function(){

  this.end = function(callback){
    callback(null, {
      url: this.url,
      data: this.data,
      headers: this.headers,
      query: this.queryData
    });
  };

  this.get = function(url){
    this.url = url;
    return this;
  };

  this.post = function(url){
    this.url = url;
    return this;
  };

  this.query = function(queryData){
    this.queryData = queryData;
    return this;
  };

  this.send = function(data){
    this.data = data;
    return this;
  };

  this.set = function(name, value){
    this.headers = this.headers || {};
    this.headers[name] = value;
  };
};
