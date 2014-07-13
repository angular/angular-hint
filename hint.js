
// decorate angular.bootstrap to check for ng-hint=
//
// everything on by default

require('angular-hint-dom');
require('angular-hint-directives');

var allModules = ['ngHintDirectives', 'ngHintDom'];

window.name = 'NG_DEFER_BOOTSTRAP!';

// determine which modules to load and resume bootstrap
document.addEventListener('DOMContentLoaded', function maybeBootstrap() {

  // we don't know if angular is loaded
  if (!angular.resumeBootstrap) {
    return setTimeout(maybeBootstrap, 1);
  }

  var modules = [], elt;

  if (elt = document.querySelector('[ng-hint-include]')) {
    modules = hintModulesFromElement(elt).map(hintModuleName);
  } else if (elt = document.querySelector('[ng-hint-exclude]')) {
    modules = excludeModules(hintModulesFromElement(elt));
  } else if (document.querySelector('[ng-hint]')) {
    modules = allModules;
  }

  angular.resumeBootstrap(modules);
});


function excludeModules(modulesToExclude) {
  modulesToExclude = modulesToExclude.map(hintModuleName);
  return allModules.filter(function(module) {
    return modulesToExclude.indexOf(module) > -1;
  });
}

function hintModulesFromElement (elt) {
  return elt.attributes['ng-hint-include'].value.split(' ');
}

function hintModuleName(name) {
  return 'ngHint' + title(name);
}

function title (str) {
  return str[0].toUpperCase() + str.substr(1);
}
