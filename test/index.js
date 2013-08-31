var Mocha = require('mocha'),
    fs = require('fs'),
    path = require('path');

var acceptance = new Mocha({
	timeout: 20000
});

console.log("Running acceptance tests...");
acceptance.addFile('./test/acceptance.js');
acceptance.run(function(failures){

	if(failures)
		process.exit(failures);

	var unit = new Mocha();

	console.log("Running unit tests...");

	fs.readdirSync('./test/unit/').filter(function(file){
	    return file.substr(-3) === '.js';

	}).forEach(function(file){
	    unit.addFile(
	        path.join('./test/unit/', file)
	    );
	});


	unit.run(function(failures){
	  process.exit(failures);
	});
});