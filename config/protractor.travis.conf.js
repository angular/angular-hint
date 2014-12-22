'use strict';

module.exports = function (options) {
  options.sauceUser = process.env.SAUCE_USERNAME;
  options.sauceKey = process.env.SAUCE_ACCESS_KEY;

  options.multiCapabilities = [{
    'browserName': 'chrome',
    'platform': 'OS X 10.9',
    'name': 'Angular Hint E2E',
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
    'build': process.env.TRAVIS_BUILD_NUMBER,
    'version': '34'
  }, {
    'browserName': 'firefox',
    'name': 'Angular Hint E2E',
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
    'build': process.env.TRAVIS_BUILD_NUMBER,
    'version': '28'
  }, {
    browserName: 'safari',
    'platform': 'OS X 10.9',
    'version': '7',
    'name': 'Angular Hint E2E',
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
    'build': process.env.TRAVIS_BUILD_NUMBER
  }];
};
