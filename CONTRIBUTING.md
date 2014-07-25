Contributing Guidelines
-----------------------

Angular-Hint is designed to be a modular tool. This way, independent Angular-Hint modules can be developed as standalone projects and later included in the overall Angular-Hint collection. We hope this will encourage you to develop your own Angular-Hint modules.

The following descriptions detail how an Angular-Hint module should be developed in order to integrate it with the overall design.

Angular-Hint Conventions
------------------------

  1. Module Definition

  The Angular-Hint module should be named in the format of `ngHintModuleName` when it is defined. For example:

  ```javascript
  angular.module('ngHintControllers', [])
  ```
  The module should be defined in a file called hint-module-name.js.
  For example:

  ```javascript
  hint-controllers.js
  ```
  It should have a corresponding test file `hint-module-name_test.js`.

  Preferably module names should consist of one descriptive word. If a one word description is too vague to convey the scope of the module, the shortest expression possible is preferred.

  2. Module Dependencies

  Each Angular-Hint module should load its own dependencies using `browserify`. For instance, `ngHintDom` depends on the library `domInterceptor`. This dependency is included within `ngHintDom` by the browserify `require` function.

  All ngHint modules should load ngHintLog as a dependency, see #3.

  3. Message Logging

  All ngHint modules should use ngHintLog to log warnings. This creates a standard pipeline for
  all AngularHint messages.

  To use ngHintLog, see its [README.md](https://github.com/angular/angular-hint-log#angular-hint-log).

  4. Module Testing

  Each ngHint module should provide its own unit tests. These tests should also be run under
  continuous integration using TravisCI, and on multiple browsers using SauceLabs. Last, the TravisCI tests
  should test versions 1.2 and 1.3 of AngularJS. Unit tests
  may be run locally using Karma and through SauceLabs on TravisCI by using the following testing configuration:

  In karma.conf.js:

  ```javascript
    module.exports = function(config) {
      config.set({
        frameworks: ['browserify', 'jasmine'],
        files: [
          'bower_components/angular/angular.js',
          'bower_components/angular-mocks/angular-mocks.js',
          'your-hint-module.js',
          'your-hint_test.js'
        ],
        exclude: [
        ],
        preprocessors: {
          'your-hint-module.js': ['browserify']
        },
        browsers: ['Chrome'],
        browserify: {
          debug: true
        }
      });
    };
  ```

  In a second karma-sauce.conf.js for testing with SauceLabs:

  ```javascript
    var baseConfig = require('./karma.conf.js');
    module.exports = function(config) {
        baseConfig(config);
        var customLaunchers = {
        'SL_Chrome': {
          base: 'SauceLabs',
          browserName: 'chrome',
          version: '35'
        },
        'SL_Firefox': {
          base: 'SauceLabs',
          browserName: 'firefox',
          version: '26'
        },
        'SL_Safari': {
          base: 'SauceLabs',
          browserName: 'safari',
          platform: 'OS X 10.9',
          version: '7'
        }
      };
      config.set({
        sauceLabs: {
          testName: 'Hint Log Unit Tests',
          startConnect: true,
          options: {
            'selenium-version': '2.37.0'
          }
        },
        customLaunchers: customLaunchers,
        browsers: Object.keys(customLaunchers),
        reporters: ['dots', 'saucelabs'],
        singleRun: true
      });
      if (process.env.TRAVIS) {
        config.sauceLabs.build = 'TRAVIS #' + process.env.TRAVIS_BUILD_NUMBER + ' (' + process.env.TRAVIS_BUILD_ID + ')';
        config.sauceLabs.tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER;

        process.env.SAUCE_ACCESS_KEY = process.env.SAUCE_ACCESS_KEY.split('').reverse().join('');
        config.transports = ['xhr-polling'];
      }
    };
  ```

  In package.json:

  ```javascript
  "scripts": {
    "test": "karma start karma-sauce.conf.js"
  },
  "dependencies": {
    "karma-sauce-launcher": "~0.2.0"
  }
  ```

  In .travis.yml:
  ```javascript
    language: node_js
    node_js:
      - 0.10
    env:
      matrix:
        - VERSION=1.2
        - VERSION=1.3
      global:
        - BROWSER_PROVIDER_READY_FILE=/tmp/sauce-connect-ready
        - LOGS_DIR=/tmp/angular-hint-controllers-build/logs
        - SAUCE_USERNAME=YOUR_SAUCE_USERNAME
        - SAUCE_ACCESS_KEY=YOUR_SAUCE_KEY
    install:
      - npm install
      - npm install -g bower
      - ./bower-install.sh
      - npm install -g karma-cli
  ```

  To use sauce labs locally, make sure you have set up appropriate credentials.

  Additionally, to test both AngularJS 1.2 and 1.3, you must set up a `bower-install.sh` script
  to install the appropriate AngularJS version for each test.

  In bower-install.sh:
  ```javascript
  #!/bin/bash
  bower install --force angular#$VERSION angular-mocks#$VERSION
  ```

  You may also install any other angular modules that depend on versioning such as angular-route
  in this way.

  After creating this script, be sure to run `chmod +x bower-install.sh` to make the file
  executable.

  To show that your tests are running on TravisCI, add the TravisCI badge to the top of your
  modules README file: [![Build Status](https://travis-ci.org/angular/angular-hint.svg?branch=master)](https://travis-ci.org/angular/angular-hint)

  To run karma locally use `karma start` and to run the sauce labs configuration use `karma
  start karma-sauce.conf.js`

  5.  Module Publishing

  All AngularHint modules should be published as npm packages.

  To publish an npm package:
  1) Check that your package.json is up to date and informative.
  2) Ensure that you have set up an [npm account](https://www.npmjs.org/), and use your credentials to log in on your machine.
  3) Tag the version of your module using `git tag` and push that tag to GitHub `git push --tags`. For instance:
    ```javascript
    git tag v0.0.0
    git push --tags
    ```
  4) Use `npm publish` inside the module directory to publish the module
  5) Use the [semver](http://semver.org/) conventions to update versions when appropriate.
     Use pre-1.0 tags to indicate the development stage.
     Use npm commands to update versions. For example:
     ``` javascript
     npm version minor
     git push
     git push --tags
     npm publish
     ```
     updates a minor node version.

  6. Module Loading

  To be included in AngularHint, an ngHintModule needs to be included in the `allModules` list in `hint.js`. Submit a PR request updating this array as well as the package.json dependency of your ngHint module to this repository to allow your ngHint module to be loaded using the `ng-hint` directives.