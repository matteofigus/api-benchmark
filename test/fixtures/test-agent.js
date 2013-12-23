module.exports.FakeAgent = function(){ 

  this.end = function(callback){
    callback(null, {
      data: this.data,
      headers: this.headers
    });
  };
  
  this.get = function(request){
    return this;
  };

  this.post = function(request){
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