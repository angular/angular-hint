# Contributing to Angular Hint

Help contribute to Angular Hint to make a better tool for yourself and other AngularJS developers!

Please read and follow our [Code of Conduct](https://github.com/angular/code-of-conduct/blob/master/CODE_OF_CONDUCT.md#contributor-code-of-conduct).

- [Open an Issue](#issue)
- [Submit a PR](#pr)
- [Coding Style Guidelines](#style)
- [Develop a Module](#module)

## <a name="issue"></a> Open an Issue

If you find a bug in AngularHint, you can help us by submitting an issue to our
[GitHub Repository](https://github.com/angular/angular-hint). If you can trace the issue to a specific AngularHint module, please go
to the module's repository to submit the issue. The current repositories for AngularHint modules are:
  - [Angular Hint Controllers](https://github.com/angular/angular-hint-controllers)
  - [Angular Hint Directives](https://github.com/angular/angular-hint-directives)
  - [Angular Hint DOM](https://github.com/angular/angular-hint-dom)
  - [Angular Hint Events](https://github.com/angular/angular-hint-events)
  - [Angular Hint Interpolation](https://github.com/angular/angular-hint-interpolation)
  - [Angular Hint Modules](https://github.com/angular/angular-hint-modules)

To help us effectively address your issue, please follow these steps:
  1. Use GitHub to search for duplicate issues. If a similar issue already exists, add more
    information to that issue rather than opening a separate thread.
  2. If there are no similar issues, open a new issue and provide as much of the following
    information as possible:
    - A description of the issue
    - A use case for when this issue occurs
    - AngularHint version and specific AngularHint module version if applicable
    - Description of the browsers and operating system you are using
    - A reproduction of the error using a tool like [Plunker](http://plnkr.co/edit),
      [JSFiddle](http://jsfiddle.net/) or an unambiguous set of steps we can follow to produce the
      issue
    - Information about any similar issues found when searching
    - A suggestion about the source of the error (line of code or commit) or a possible fix
  3. Keep an eye on your issue after submission to see our response or to answer questions if we
    ask for clarification.
  4. Feel good about helping us to improve AngularHint!

Know how to fix the issue? Feel free to submit a [Pull Request](#pr) that fixes it!

## <a name="pr"></a> Submit a PR

If you know how to fix an issue with AngularHint or an AngularHint module, please feel free to
send us a Pull Request. Following these steps will help us to include your code:

  1. Search the list of [open and closed PRs on AngularHint](https://github.com/angular/angular-hint/pulls)
    or on the module you would like to contribute to in order to make sure that you are not duplicating
    another person's effort.
  2. Make your changes in a new git branch

    ```shell
     git checkout -b my-fix-branch master
     ```
  3. Create your patch,  **including appropriate test cases**
  4. Follow our [Coding Style Guidelines](#style)
  5. Run the AngularHint protractor testing suite using the `gulp` command, or run an AngularHint
    module's unit tests using `karma start`. Ensure that all tests pass.
  6. Commit your changes using a descriptive commit message that follows our [commit guidelines](#commit)

     ```shell
     git commit -a
     ```
    Note: the optional commit `-a` command line option will automatically "add" and "rm" edited files.
  7. Build your changes locally to ensure all the tests pass
    For AngularHint:

    ```shell
    gulp
    ```

    For an AngularHint module:

    ```shell
    karma start
    ```
  8. Push your branch to GitHub:

    ```shell
    git push origin my-fix-branch
    ```
  9. In GitHub, send a pull request to AngularHint or the appropriate AngularHint module
  10. If we suggest changes then:
      - Make the required updates
      - Re-run the tests and ensure they are still passing
      - Rebase your branch and force push to your GitHub repository (this will update your PR):

        ```shell
          git rebase master -i
          git push -f
        ```
  11. After your pull request is merged you can delete your branch an pull the changes from the
    main repository.

      - Delete the remote branch:

      ```shell
      git push origin --delete my-fix-branch
      ```
      - Check out the master branch:

      ```shell
      git checkout master -f
      ```

      - Delete the local branch:

      ```shell
      git branch -D my-fix-branch
      ```

      - Update your master with the latest upstream version:

      ```shell
      git pull --ff upstream master
      ```
  12. Celebrate your contribution to AngularHint! Thank you!


##<a name="style"></a> Coding Style Guidelines

  To help keep the code in AngularHint and the AngularHint modules consistent, please follow
  these conventions.

###1. AngularHint Guidelines

#### Naming
  - AngularHint should be referred to as 'Angular Hint' in titles. In bodies of text it should
  be referred to as 'AngularHint'.
  - The same guidelines apply to AngularHint modules. They should be referred to as
  'Angular Hint Module Name' in titles and as AngularHintModuleName in bodies of text. In
  titles there should not be colon between 'Angular Hint' and the module's name.
  - In code, the central module of an AngularHint module should be named, 'ngHintModuleName'.

#### Testing

  - All features should be covered by appropriate tests. In AngularHint the e2e tests
  are run through protractor and contained in the `e2e` directory. In individual AngularHint
  modules the unit tests are run through karma. Check the existing tests in the module you are working
  with to see the conventions for that module.

#### Coding

  - Wrap all code at **100 characters**.
  - Instead of complex inheritance heirarchies, use simple objects.
  - Prefer functions and closures to objects.

####<a name="commit"></a> Commit guidelines

  Commit messages help us to create a dynamic record of changes to our code. By making
  readable and consistent commit messages, we automatically document our coding decisions.
  Since we use these commits as documentation, please follow these conventions to make
  readable commit messages.

  Each commit message consists of a **header**, a **body** and a **footer**.  The header has a special
  format that includes a **type**, a **scope** and a **subject**:

  ```
  <type>(<scope>): <subject>
  <BLANK LINE>
  <body>
  <BLANK LINE>
  <footer>
  ```

  Any line of the commit message cannot be longer 100 characters! This allows the message to be easier
  to read on github as well as in various git tools.

##### Type

  Must be one of the following:

  * **feat**: A new feature
  * **fix**: A bug fix
  * **docs**: Documentation only changes
  * **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing
    semi-colons, etc)
  * **refactor**: A code change that neither fixes a bug or adds a feature
  * **perf**: A code change that improves performance
  * **test**: Adding missing tests
  * **chore**: Changes to the build process or auxiliary tools and libraries such as documentation
    generation

###### Scope
  The scope could be anything specifying place of the commit change. For example `$location`,
  `$browser`, `$compile`, `$rootScope`, `ngHref`, `ngClick`, `ngView`, etc...

###### Subject
  The subject contains succinct description of the change:

  * use the imperative, present tense: "change" not "changed" nor "changes"
  * don't capitalize first letter
  * no dot (.) at the end

###### Body
  Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes"
  The body should include the motivation for the change and contrast this with previous behavior.

###### Footer
  The footer should contain any information about **Breaking Changes** and is also the place to
  reference GitHub issues that this commit **Closes**.

###2. <a name="module"></a> AngularHint Module Guidelines
AngularHint is designed to be a modular tool. This way, independent AngularHint modules can be developed as standalone projects and later included in the overall AngularHint collection. We hope this will encourage the development
of further AngularHint modules that cover different facets of AngularJS.

The following steps describe how an AngularHint module should be developed.

1. Module Definition

  - The AngularHint module should be named in the format of `ngHintModuleName` when it is defined.
    For example:

    ```javascript
    angular.module('ngHintControllers', [])
    ```
  - The module should be defined in a file called hint-module-name.js. (Ex: `hint-controllers.js`)
  - It should have a corresponding test file `hint-module-name_test.js`. (Ex: `hint-controllers_test.js`)
  - Preferably module names should consist of one descriptive word. If a one word description is too vague to convey the scope of the module, the shortest expression possible is preferred.

2. Module Dependencies

  - Each AngularHint module should load its own dependencies using `browserify`. For instance, AngularHintDOM depends on the library `domInterceptor`. This dependency is included within AngularHintDom by the browserify `require` function.
  - All AngularHint modules should load AngularHintLog as a dependency, see #3.

3. Message Logging

All AngularHint modules should use AngularHintLog to log their messages. This creates a standard pipeline for
all AngularHint messages.

To use AngularHintLog, see its [README.md](https://github.com/angular/angular-hint-log#angular-hint-log).

4. Module Testing

Each AngularHint module should provide its own unit tests.

- Tests for the overall behavior of the module should be included in a file named `hint-module-name_test.js`.
  If the module consists of many individual functions loaded by browserify, a directory
  of /test unit tests may also be appropriate. See [AngularHintDirectives tests](https://github.com/angular/angular-hint-directives/tree/master/test) as an example.
- These tests should also be run under continuous integration using TravisCI and on multiple
  browsers using SauceLabs. Last, the TravisCI tests
  should test versions 1.2 and 1.3 of AngularJS. Unit tests may be run locally using Karma and through
  SauceLabs on TravisCI by using the following testing configuration:

  In karma.conf.js:

  ```javascript
    //karma.conf.js
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
    //karma-sauce.conf.js
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
  //package.json
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
  in bower-install.sh.

  After creating this script, be sure to run `chmod +x bower-install.sh` to make the file
  executable.

  To show that your tests are running on TravisCI, add the TravisCI badge to the top of your
  module's README file: [![Build Status](https://travis-ci.org/angular/angular-hint.svg?branch=master)](https://travis-ci.org/angular/angular-hint)

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

To be included in AngularHint, an AngularHint module needs to be installed, required through browserify and included in the `allModules` list in `hint.js`. A PR to update AngularHint to load a new module should include:

```javascript
  //hint.js
  //existing code
  require('angular-hint-dom');
  require('angular-hint-directives');
  ...
  //new module in alphabetical order
  require('new-angular-hint-module');
  ...

  // List of all possible modules
  // The default ng-hint behavior loads all modules
  var allModules = ['ngHintControllers', 'ngHintDirectives', 'ngHintDom', 'ngHintEvents',
  'ngHintInterpolation', 'ngHintModules', 'newModuleInAlphabeticalOrder'];
```

```javascript
  //package.json
  "dependencies": {
    "angular-hint-controllers": "0.3.0",
    "angular-hint-directives": "0.1.0",
    "angular-hint-dom": "0.3.0",
    "angular-hint-events": "^0.2.0",
    "angular-hint-interpolation": "^0.2.0",
    "angular-hint-log": "0.2.0",
    "angular-hint-modules": "0.3.0",
    "angular-hint-new-module": "0.0.0"
  },
```
