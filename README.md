api-benchmark
=============
[![Build Status](https://secure.travis-ci.org/matteofigus/api-benchmark.png?branch=master)](http://travis-ci.org/matteofigus/api-benchmark)
[![NPM](https://nodei.co/npm/api-benchmark.png?downloads=true)](https://npmjs.org/package/api-benchmark)

A node.js tool that measures and compares performances of single and multiple apis using [BenchmarkJs](http://benchmarkjs.com/)

To see an example of a request/response [look at this gist](https://gist.github.com/matteofigus/6651234)

# Installation

  npm install api-benchmark

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
  (Boolean): Displays some info on the console

#### delay
  (Number): The delay between test cycles (secs)

#### initCount
  (Number): The default number of times to execute a test on a benchmark's first cycle.

#### maxTime
  (Number): The maximum time a benchmark is allowed to run before finishing (secs).
  Note: Cycle delays aren't counted toward the maximum time.

#### minSamples
  (Number): The minimum sample size required to perform statistical analysis.

#### minTime
  (Number): The time needed to reduce the percent uncertainty of measurement to 1% (secs).

# Tests

  npm test

# License

MIT

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/matteofigus/api-benchmark/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
