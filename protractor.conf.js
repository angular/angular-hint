'use strict';

exports.config = {
  baseUrl: 'http://localhost:8080/e2e/',
  
  capabilities: {
    'browserName': 'chrome'
  },

  specs: ['hint_test.js'],

  jasmineNodeOpts: {
    showColors: true
  }
};
