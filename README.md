api-benchmark
=============
[![Build Status](https://secure.travis-ci.org/matteofigus/api-benchmark.png?branch=master)](http://travis-ci.org/matteofigus/api-benchmark)

A node.js tool that compares performances of different apis using [BenchmarkJs](http://benchmarkjs.com/)

To see an example of a request/response [look at this gist](https://gist.github.com/matteofigus/6651234)

# Installation

	npm install api-benchmark

# Usage

### compare(services, routes, [, options], callback)

	var apiBenchmark = require('api-benchmark');
	
	var services = { 
		server1: "http://myserver:myport/mypath",
		server2: "http://myserver2:myport2/mypath2",
	};

	var routes = { route1: '/route1', route2: '/route2' };

	apiBenchmark.compare(services, routes, function(results){
      console.log(results);
      // displays some stats, including the winner!
    });

All the Http verbs and headers are supported:

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

	apiBenchmark.compare(services, routes, function(results){
      console.log(results);
      // displays some stats, including the winner!
    });

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