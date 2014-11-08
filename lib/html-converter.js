'use strict';

var fs = require('fs');
var path = require('path');
var _ = require('underscore');

module.exports = {
  getHtml: function(input, options, callback){

    if(_.isFunction(options)){
      callback = options;
      options = {};
    }

    fs.readFile(path.join(__dirname, '../templates/report.html'), 'utf-8', function(err, template){

      if(err) {
        return callback(err);
			}

      var obj = {
        benchmark: input,
        info: {
          date: new Date(),
          apiName: _.keys(input)[0]
        }
      };

      var templateWithData = template.replace('{{ data }}', JSON.stringify(obj).replace(/<\/script>/g, '</scr"+"ipt>'));

      callback(null, templateWithData);
    });
  }
};
