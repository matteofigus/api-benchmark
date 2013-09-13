api-benchmark
=============
[![Build Status](https://secure.travis-ci.org/matteofigus/api-benchmark.png?branch=master)](http://travis-ci.org/matteofigus/api-benchmark)

A simple node.js tool to compare performances of different apis

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

Different Http verbs are supported:

	var apiBenchmark = require('api-benchmark');
	
	var services = { 
		server1: "http://myserver:myport/mypath",
		server2: "http://myserver2:myport2/mypath2",
	};

	var routes = { 
		route1: {
			method: 'get',
			route: '/getRoute'
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


# License

MIT