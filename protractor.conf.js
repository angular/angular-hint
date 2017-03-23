'use strict';

var travisConfig = require('./config/protractor.travis.conf');

var options = {
  baseUrl: 'http://localhost:9000/e2e/',

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
