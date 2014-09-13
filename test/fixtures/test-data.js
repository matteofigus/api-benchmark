var testData = {
  getAveragesArray: function(servers){
    var averages = [];
    for(server in servers){
      var nVal = servers[server].numericValues;

      var average = {
        name: server,
        stats: { moe: nVal, rme: nVal, deviation: nVal, variance: nVal, mean: nVal, sem: nVal, p75: nVal, p95: nVal, p99:nVal, p999:nVal},
        hz: nVal        
      }
      averages.push(average);
    }
    return averages;
  },
  getServerResults: function(serverName, routes){
    var results = {};

    for(route in routes){
      var nVal = routes[route].numericValues;

      results[route] = {
        name: serverName + "/" + route,
        stats: { moe: nVal, rme: nVal, deviation: nVal, variance: nVal, mean: nVal, sem: nVal, p75: nVal, p95: nVal, p99:nVal, p999:nVal},
        hz: nVal
      };
    }
    return results;
  },
  getServersResults: function(serversArray){
    var results = {};
    for(var i = 0; i < serversArray.length; i++)
      results[serversArray[i].name] = testData.getServerResults(serversArray[i].name, serversArray[i].routes);

    return results;
  }
};

module.exports = testData;