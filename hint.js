'use strict';

// Create pipe for all hint messages from different modules
require('./src/modules/hintEmitter');

// Load angular hint modules
require('./src/modules/controllers');
// require('./src/modules/directives');
// require('./src/modules/dom');
require('./src/modules/events');
// require('./src/modules/interpolation');
require('./src/modules/modules');
require('./src/modules/scopes');

// List of all possible modules
// The default ng-hint behavior loads all modules
var AVAILABLE_MODULES = [
  'ngHintControllers',
// 'ngHintDirectives',
//  'ngHintDom',
  'ngHintEvents',
//  'ngHintInterpolation',
  'ngHintModules',
  'ngHintScopes'
];

var SEVERITY_WARNING = 2;
var DEFER_LABEL = 'NG_DEFER_BOOTSTRAP!';

var deferRegex = new RegExp('^' + DEFER_LABEL + '.*');
// Determine whether this run is by protractor.
// If protractor is running, the bootstrap will already be deferred.
// In this case `resumeBootstrap` should be patched to load the hint modules.
if (deferRegex.test(window.name)) {
  var originalResumeBootstrap;
  Object.defineProperty(angular, 'resumeBootstrap', {
    get: function() {
      return function(modules) {
        return originalResumeBootstrap.call(angular, modules.concat(loadModules()));
      };
    },
    set: function(resumeBootstrap) {
      originalResumeBootstrap = resumeBootstrap;
    }
  });
}
//If this is not a test, defer bootstrapping
else {
  window.name = DEFER_LABEL + window.name;

  // determine which modules to load and resume bootstrap
  document.addEventListener('DOMContentLoaded', maybeBootstrap);

  /* angular should remove DEFER_LABEL from window.name, but if angular is never loaded, we want
   to remove it ourselves, otherwise hint will incorrectly detect protractor as being present on
   the next page load */
  window.addEventListener('beforeunload', function() {
    if (deferRegex.test(window.name)) {
      window.name = window.name.substring(DEFER_LABEL.length);
    }
  });
}

function maybeBootstrap() {
  // we don't know if angular is loaded
  if (!angular.resumeBootstrap) {
    return setTimeout(maybeBootstrap, 1);
  }

  var modules = loadModules();
  angular.resumeBootstrap(modules);
}

function loadModules() {
  var modules = [], elt;
  if (angular.version.minor < 2) {
    return modules;
  }

  if ((elt = document.querySelector('[ng-hint-include]'))) {
    modules = hintModulesFromElement(elt);
  } else if (elt = document.querySelector('[ng-hint-exclude]')) {
    modules = excludeModules(hintModulesFromElement(elt));
  } else if (document.querySelector('[ng-hint]')) {
    modules = AVAILABLE_MODULES;
  } else {
    angular.hint.emit('general:noinclude', 'ngHint is included on the page, but is not active because ' +
      'there is no `ng-hint` attribute present', SEVERITY_WARNING);
  }
  return modules;
}

function excludeModules(modulesToExclude) {
  return AVAILABLE_MODULES.filter(function(module) {
    return modulesToExclude.indexOf(module) === -1;
  });
}

function hintModulesFromElement (elt) {
  var selectedModules = (elt.attributes['ng-hint-include'] ||
    elt.attributes['ng-hint-exclude']).value.split(' ');

  return selectedModules.map(hintModuleName).filter(function (name) {
    return (AVAILABLE_MODULES.indexOf(name) > -1) ||
      angular.hint.emit('general:404module', 'Module ' + name + ' could not be found', SEVERITY_WARNING);
  });
}

function hintModuleName(name) {
  return 'ngHint' + title(name);
}

function title(str) {
  return str[0].toUpperCase() + str.substr(1);
}

var LEVELS = [
  'error',
  'warning',
  'suggestion'
];
