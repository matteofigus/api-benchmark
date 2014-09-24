'use strict';

var format = require('../../lib/format');
var should = require('should');

describe('format', function(){

  it('should format a simple string', function(done){
    var formatted = format('hello {0}', 'world');

    formatted.should.be.eql('hello world');
    done();
  });

  it('should format a long string with multiple parameters', function(done){
    var dante = 'Nel {0} del {2} di {1}',
        formatted = format(dante, 'mezzo', 'nostra vita', 'cammin');

    formatted.should.be.eql('Nel mezzo del cammin di nostra vita');
    done();
  });

  it('should format a long string with repeating parameters', function(done){
    var barbie = 'I\'m a {0} {1} in a {0} world',
        formatted = format(barbie, 'Barbie', 'girl');

    formatted.should.be.eql('I\'m a Barbie girl in a Barbie world');

    done();
  });
});
