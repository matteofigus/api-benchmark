var Mocha = require('mocha'),
    fs = require('fs');

var runAcceptanceTests = function(callback){
	var acceptance = new Mocha({timeout: 20000 });
	console.log("Running acceptance tests...");

	acceptance.addFile('./test/acceptance.js');
	acceptance.run(callback);
};

var runUnitTests = function(callback){
	var unit = new Mocha();
	console.log("Running unit tests...");

	fs.readdirSync('./test/unit/')
		.filter(function(file){ return file.substr(-3) === '.js';})
		.forEach(function(file){ unit.addFile('./test/unit/' + file); });

	unit.run(callback);
};

runUnitTests(function(failures){
	if(failures)
		process.exit(failures);
	else
		runAcceptanceTests(function(failures){
			process.exit(failures);
		});
});