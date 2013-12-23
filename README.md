api-benchmark [![Build Status](https://secure.travis-ci.org/matteofigus/api-benchmark.png?branch=master)](http://travis-ci.org/matteofigus/api-benchmark)
=============

[![NPM](https://nodei.co/npm/api-benchmark.png?downloads=true)](https://npmjs.org/package/api-benchmark)

A node.js tool that measures and compares performances of single and multiple apis inspired by [BenchmarkJs](http://benchmarkjs.com/)

To see an example of a request/response [look at this gist](https://gist.github.com/matteofigus/6651234)

I you want to benchmark your api via [grunt](http://gruntjs.com/) take a look at [grunt-api-benchmark](https://github.com/matteofigus/grunt-api-benchmark).

# Installation

```shell
  npm install api-benchmark
```

# Usage

### measure(service, routes, [options, ] callback)

Measures performances of a given api for multiple routes

```js
var apiBenchmark = require('api-benchmark');

var service = { 
  server1: "http://myserver:myport/mypath"
};

var routes = { route1: '/route1', route2: '/route2' };

apiBenchmark.measure(service, routes, function(err, results){
  console.log(results);
  // displays some stats!
});
```

### compare(services, routes, [options, ] callback)

Compares performances of a given list of api servers with the same routes. Useful in case of load balancers, globalised services, deployment of new versions.

```js
var apiBenchmark = require('api-benchmark');

var services = { 
  server1: "http://myserver:myport/mypath",
  server2: "http://myserver2:myport2/mypath2",
};

var routes = { route1: '/route1', route2: '/route2' };

apiBenchmark.compare(services, routes, function(err, results){
  console.log(results);
  // displays some stats, including the winner!
});
```

All the Http verbs and headers are supported.

```js
var apiBenchmark = require('api-benchmark');

var services = { 
  server1: "http://myserver:myport/mypath",
  server2: "http://myserver2:myport2/mypath2",
};

var routes = { 
  route1: {
    method: 'get',
    route: '/getRoute',
    headers: {
          'Cookie': 'cookieName=value',
          'Accept': 'application/json'
    }
  },
  route2: '/getRoute2',
  route3: { 
    method: 'post', 
    route: '/postRoute', 
    data: { 
      test: true, 
      moreData: 'aString' 
    }
  }
};

apiBenchmark.compare(services, routes, function(err, results){
  console.log(results);
  // displays some stats, including the winner!
});
```

To check the response use the optional 'expectedStatusCode' parameter for a specific route. If the status code of the response is wrong, the benchmarks will terminate and an appropriate error will be fired.

```js 
var apiBenchmark = require('api-benchmark');

var services = { 
  server1: "http://myserver:myport/mypath",
  server2: "http://myserver2:myport2/mypath2",
};

var routes = {
  route1: {
    route: '/not-existing-route',
    method: 'get',
    expectedStatusCode: 200
  }
};

apiBenchmark.compare(services, routes, function(err, results){
  console.log(err);
  // displays 'Expected Status code was 200 but I got a 404 for server1/route1'
});
```

### Options

#### debug
  (Boolean, default false): Displays some info on the console.

#### runMode
  (String, default 'sequence'): Can be 'sequence' (each request is made after receiving the previous response) or 'parallel' (all requests are made in parallel).

#### maxConcurrentRequests
  (Number, default 100): When in runMode='parallel' it is the maximum number of concurrent requests are made.

#### delay
  (Number, default 0): When in runMode='sequence', it is the delay between test cycles (secs).

#### maxTime
  (Number, default 10): The maximum time a benchmark is allowed to run before finishing (secs).
  Note: Cycle delays aren't counted toward the maximum time.

#### minSamples
  (Number, default 20): The minimum sample size required to perform statistical analysis.

# Tests

```shell
  npm test
```

# License

MIT

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/matteofigus/api-benchmark/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
