'use strict';

var travisConfig = require('./config/protractor.travis.conf');

var options = {
  baseUrl: 'http://localhost:8080/e2e/',

  capabilities: {
    'browserName': 'chrome'
  },

  specs: ['e2e/**/*.spec.js'],

  jasmineNodeOpts: {
    showColors: true
  }
};

if (process.argv.indexOf('--travis') > -1) {
  travisConfig(options);
}

exports.config = options;
