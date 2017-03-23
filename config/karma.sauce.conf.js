/*
 * karma.conf.js and karma.es5.conf.js optionally load this
 */

var CUSTOM_LAUNCHERS = {
  'SL_Chrome': {
    base: 'SauceLabs',
    browserName: 'chrome',
    version: 'latest'
  },
  'SL_Firefox': {
    base: 'SauceLabs',
    browserName: 'firefox',
    version: 'latest'
  },
  'SL_Safari': {
    base: 'SauceLabs',
    browserName: 'safari',
    platform: 'OS X 10.12',
    version: '10'
  }
};

module.exports = function(options) {
  options.sauceLabs = {
    testName: 'Angular Router Unit Tests',
    startConnect: true
  };
  options.customLaunchers = CUSTOM_LAUNCHERS;
  options.browsers = Object.keys(CUSTOM_LAUNCHERS);
  options.reporters = ['dots', 'saucelabs'];
};
