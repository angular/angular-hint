//Create pipe for all hint messages from different modules
angular.hint = require('angular-hint-log');

// Load angular hint modules
require('angular-hint-controllers');
require('angular-hint-directives');
require('angular-hint-dom');
require('angular-hint-events');
require('angular-hint-interpolation');
require('angular-hint-modules');

// List of all possible modules
// The default ng-hint behavior loads all modules
var allModules = ['ngHintControllers', 'ngHintDirectives', 'ngHintDom', 'ngHintEvents',
  'ngHintInterpolation', 'ngHintModules'];

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

  if ((elt = document.querySelector('[ng-hint-include]'))) {
    modules = hintModulesFromElement(elt);
  } else if (elt = document.querySelector('[ng-hint-exclude]')) {
    modules = excludeModules(hintModulesFromElement(elt));
  } else if (document.querySelector('[ng-hint]')) {
    modules = allModules;
  } else {
    angular.hint.logMessage('##General## ngHint is included on the page, but is not active because'+
      ' there is no `ng-hint` attribute present');
  }
  return modules;
}

function excludeModules(modulesToExclude) {
  return allModules.filter(function(module) {
    return modulesToExclude.indexOf(module) === -1;
  });
}

function hintModulesFromElement (elt) {
  var selectedModules = (elt.attributes['ng-hint-include'] ||
    elt.attributes['ng-hint-exclude']).value.split(' ');

  return selectedModules.map(hintModuleName).filter(function (name) {
    return (allModules.indexOf(name) > -1) ||
      angular.hint.logMessage('##General## Module ' + name + ' could not be found');
  });
}

function hintModuleName(name) {
  return 'ngHint' + title(name);
}

function title(str) {
  return str[0].toUpperCase() + str.substr(1);
}

function flush() {
  var log = angular.hint.flush(), groups = Object.keys(log);
  for(var i = 0, ii = groups.length; i < ii; i++) {
    console.groupCollapsed? console.groupCollapsed('Angular Hint: ' + groups[i]) :
      console.log('Angular Hint: ' + groups[i]);
    var messages = Object.keys(log[groups[i]]);
    for(var j = 0, jj = messages.length; j < jj; j++) {
      console.log(messages[j]);
    }
    console.groupEnd && console.groupEnd();
  }
}
setInterval(flush, 5);
