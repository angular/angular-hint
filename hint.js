
// decorate angular.bootstrap to check for ng-hint=
//
// everything on by default

require('angular-hint-dom');
require('angular-hint-directives');

var defaultModules = ['ngHintDirectives', 'ngHintDom'];

window.name = 'NG_DEFER_BOOTSTRAP!';

// determine which modules to load and resume bootstrap
angular.element(document).ready(function() {
  var selectedModules;
  var elts = document.querySelectorAll('[ng-hint]');
  if(elts.length > 0) {
    selectedModules = elts[0].attributes['ng-hint'].value.split(' ').map(function(name) {
      return 'ngHint' + name[0].toUpperCase() + name.substring(1);
    });
  } else {
    selectedModules = defaultModules;
  }
  angular.resumeBootstrap(selectedModules)
});
