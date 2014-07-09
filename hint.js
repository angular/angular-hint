
// decorate angular.bootstrap to check for ng-hint=
//
// everything on by default

require('angular-hint-dom');
require('angular-hint-directives');

var allModules = ['ngHintDirectives', 'ngHintDom'];

window.name = 'NG_DEFER_BOOTSTRAP!';

// determine which modules to load and resume bootstrap
angular.element(document).ready(function() {
  var selectedModules;
  var elts;
  elts = document.querySelectorAll('[ng-hint-include]');
  if(elts.length > 0) {
    console.log('include');
    selectedModules = elts[0].attributes['ng-hint-include'].value.split(' ').map(function(name) {
      return 'ngHint' + name[0].toUpperCase() + name.substring(1);
    });
  }
  else {
    elts = document.querySelectorAll('[ng-hint-exclude]');
    if(elts.length > 0) {
      elts = elts[0].attributes['ng-hint-exclude'].value.split(' ');
      selectedModules = allModules.filter(function(name) {
        var notFound = true;
        elts.forEach(function(element) {
          if(('ngHint' + element[0].toUpperCase() + element.substring(1)) == name)
          {
            notFound = false;
          }
        });
        if(notFound) {
          return name;
        }
      });
    }
    else {
      elts = document.querySelectorAll('[ng-hint]');
      if(elts.length > 0) {
        selectedModules = allModules;
      }
    }
  }
  if(selectedModules != undefined) {
    angular.resumeBootstrap(selectedModules);
  }
  else {
    angular.resumeBootstrap();
  }
});
