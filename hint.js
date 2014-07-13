
// decorate angular.bootstrap to check for ng-hint=
//
// everything on by default

require('angular-hint-dom');
require('angular-hint-directives');

var allModules = ['ngHintDirectives', 'ngHintDom'];
var isTest = false;
if(window.name === 'NG_DEFER_BOOTSTRAP!') {
  isTest = true;
  var originalResumeBootstrap;
  Object.defineProperty(angular, 'resumeBootstrap', {
    get: function() {
      return function(modules) {
        return(originalResumeBootstrap.call(angular, modules.concat(loadHintModules())))
      }
    },
    set: function(resumeBootstrap) {
      originalResumeBootstrap = resumeBootstrap;

    }
  });
  console.log = function(message) {
    var log = document.getElementById('console');
    log.innerHTML = message;
  }
}
else {
  window.name = 'NG_DEFER_BOOTSTRAP!';
}

function loadHintModules() {
  var selectedModules;
  var elts;
  var includeModules = function(modulesToInclude) {
    var selected = modulesToInclude.map(function(name) {
      return 'ngHint' + name[0].toUpperCase() + name.substring(1);
    });
    return selected;
  };
  var excludeModules = function(modulesToExclude) {
    var selected = allModules.filter(function(name) {
      var notFound = true;
      modulesToExclude.forEach(function(element) {
        if(('ngHint' + element[0].toUpperCase() + element.substring(1)) == name) {
          notFound = false;
        }
      });
      if(notFound) {
        return name;
      }
    });
    return selected;
  };
  elts = document.querySelectorAll('[ng-hint-include]');
  if(elts.length > 0) {
    selectedModules = includeModules(elts[0].attributes['ng-hint-include'].value.split(' '));
  }
  else {
    elts = document.querySelectorAll('[ng-hint-exclude]');
    if(elts.length > 0) {
      selectedModules = excludeModules(elts[0].attributes['ng-hint-exclude'].value.split(' '));
    }
    else {
      elts = document.querySelectorAll('[ng-hint]');
      if(elts.length > 0) {
        selectedModules = allModules;
      }
    }
  }
  return selectedModules;
};

// determine which modules to load and resume bootstrap
angular.element(document).ready(function() {
  if(!isTest) {
    var modules = loadHintModules();
    if(modules != undefined) {
      angular.resumeBootstrap(modules);
    }
    else {
      angular.resumeBootstrap();
    }
  }
});
