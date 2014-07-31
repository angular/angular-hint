# Angular Hint [![Build Status](https://travis-ci.org/angular/angular-hint.svg?branch=master)](https://travis-ci.org/angular/angular-hint) [![Code Climate](https://codeclimate.com/github/angular/angular-hint/badges/gpa.svg)](https://codeclimate.com/github/angular/angular-hint)

Runtime hinting for AngularJS.

## Usage

Add `<script src="hint.js"></script>` to your app's `index.html` immediately after the
`angular.js` script.

This will load the set of AngularHint modules. Now you are set to use the `ng-hint` directive.

Including the `ng-hint` directive with no parameters will install all the AngularHint modules.

Example:

```
  <!doctype html>
  <html ng-app='sample' ng-hint>
    ...
    <script src="../../bower_components/angular/angular.js"></script>
    <script src="../../dist/hint.js"></script>
    ...
  </html>
```

For more fine-grained hints, you can use `ng-hint-include` to include certain AngularHint modules or
`ng-hint-exclude` to exclude certain AngularHint modules.

Example:

```
  <!doctype html>
  <html ng-app='sample' ng-hint-include="controllers dom">
    ...
    <script src="../../bower_components/angular/angular.js"></script>
    <script src="../../dist/hint.js"></script>
    ...
  </html>
```

```
  <!doctype html>
  <html ng-app='sample' ng-hint-exclude="modules">
    ...
    <script src="../../bower_components/angular/angular.js"></script>
    <script src="../../dist/hint.js"></script>
    ...
  </html>
```

## Building

```shell
$ npm install
```

```shell
$ npm run build
```

## See Also

AngularHint is composed of several small modules that you may want to use individually:

* [AngularHintControllers](https://github.com/angular/angular-hint-controllers)
* [AngularHintDirectives](https://github.com/angular/angular-hint-directives)
* [AngularHintDom](https://github.com/angular/angular-hint-dom)
* [AngularHintEvents](https://github.com/angular/angular-hint-events)
* [AngularHintInterpolation](https://github.com/angular/angular-hint-interpolation)
* [AngularHintModules](https://github.com/angular/angular-hint-modules)

AngularHint uses [AngularHintLog](https://github.com/angular/angular-hint-log) to provide
logging functionality.

## Interested in Contributing?
See the [Contributing Guidelines](https://github.com/angular/angular-hint/blob/master/CONTRIBUTING.md)

## License
Apache 2.0
