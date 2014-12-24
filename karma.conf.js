'use strict';

var sauceConfig = require('./config/karma.sauce.conf');
var travisConfig = require('./config/karma.travis.conf');
//var fs = require('fs');

//fs.readdirSync(__dirname + '/src/modules').filter

module.exports = function(config) {
  var options = {
    frameworks: ['browserify', 'jasmine'],
    files: [
      'node_modules/angular/angular.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'src/modules/log.js',
      'src/modules/*.js'
    ],
    preprocessors: {
      'lib/modules/controllers.js': ['browserify'],
      'lib/modules/events.js': ['browserify'],
      'lib/modules/scopes.js': ['browserify']
    },
    browsers: ['Chrome'],
    browserify: {
      debug: true
    }
  };

  if (process.argv.indexOf('--sauce') > -1) {
    sauceConfig(options);
    travisConfig(options);
  }

  config.set(options);
};
