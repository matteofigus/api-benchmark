'use strict';

var DebugHelper = require('./debug-helper');
var htmlConverter = require('./html-converter');
var sanitise = require('./sanitise');
var superagent = require('superagent');
var SuitesManager = require('./suites-manager');

var suites = {
  start: function(services, endpoints, options, callback){

    var parameters = sanitise.initialInput(services, endpoints, options, callback),
        suites = new SuitesManager(superagent, new DebugHelper());

    suites.setOptions(parameters.options)
          .addEndpoints(parameters.endpoints)
          .addServices(parameters.services)
          .onBenchResults(parameters.callback)
          .start();

    return suites;
  }
};

module.exports.compare = module.exports.measure = suites.start;
module.exports.getHtml = htmlConverter.getHtml;
