// Load angular hint modules
angular.hint = require('angular-hint-log');
require('angular-hint-controllers');
require('angular-hint-dom');

// List of all possible modules
// The default ng-hint behavior loads all modules
var allModules = ['ngHintController', 'ngHintDom'];

// Determine whether this run is by protractor.
// If protractor is running, the bootstrap will already be deferred.
// In this case `resumeBootstrap` should be patched to load the hint modules.
if (window.name === 'NG_DEFER_BOOTSTRAP!') {
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
  window.name = 'NG_DEFER_BOOTSTRAP!';

  // determine which modules to load and resume bootstrap
  document.addEventListener('DOMContentLoaded', maybeBootstrap);
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

  if (elt = document.querySelector('[ng-hint-include]')) {
    modules = hintModulesFromElement(elt).map(hintModuleName).filter(function (name) {
      return (allModules.indexOf(name) > -1) ||
          angular.hint.logMessage('Module ' + name + ' could not be found');
    });
  } else if (elt = document.querySelector('[ng-hint-exclude]')) {
    modules = excludeModules(hintModulesFromElement(elt));
  } else if (document.querySelector('[ng-hint]')) {
    modules = allModules;
  } else {
    angular.hint.logMessage('Info: ngHint is included on the page, but is not active because there is no `ng-hint` attribute present');
  }
  return modules;
}

function excludeModules(modulesToExclude) {
  modulesToExclude = modulesToExclude.map(hintModuleName);
  return allModules.filter(function(module) {
    return modulesToExclude.indexOf(module) == -1;
  });
}

function hintModulesFromElement (elt) {
  return (elt.attributes['ng-hint-include'] || elt.attributes['ng-hint-exclude']).value.split(' ');
}

function hintModuleName(name) {
  return 'ngHint' + title(name);
}

function title(str) {
  return str[0].toUpperCase() + str.substr(1);
}
