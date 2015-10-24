'use strict';

var Mocha = require('mocha'),
    fs = require('fs');

var runAcceptanceTests = function(callback){
	console.log('Running acceptance tests...');
	var acceptance = new Mocha({timeout: 60000, reporter: 'spec' });

	fs.readdirSync('./test/acceptance/')
		.filter(function(file){ return file.substr(-3) === '.js';})
		.forEach(function(file){ acceptance.addFile('./test/acceptance/' + file); });

	acceptance.run(callback);
};

var runUnitTests = function(callback){
	console.log('Running unit tests...');
	var unit = new Mocha({ reporter: 'spec'});

	fs.readdirSync('./test/unit/')
		.filter(function(file){ return file.substr(-3) === '.js';})
		.forEach(function(file){ unit.addFile('./test/unit/' + file); });

	unit.run(callback);
};

runUnitTests(function(failures){
	if(failures) {
		process.exit(failures);
	} else {
		runAcceptanceTests(process.exit);
	}
});
