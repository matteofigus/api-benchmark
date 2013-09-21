module.exports.FakeAgent = function(){ 

  this.end = function(callback){
    callback({
      data: this.data,
      header: this.header
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
    this.header = this.header || {};
    this.header[name] = value;
  }; 
};