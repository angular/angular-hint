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

  4.  Module Publishing

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

  5. Module Loading

  To be included in AngularHint, an ngHintModule needs to be included in the `allModules` list in `hint.js`. Submit a PR request updating this array as well as the package.json dependency of your ngHint module to this repository to allow your ngHint module to be loaded using the `ng-hint` directives.