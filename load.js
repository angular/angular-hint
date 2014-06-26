
// decorate angular.bootstrap to check for ng-hint=
//
// everything on by default

var moduleNames = ['deedLib', 'controllerTrainer'];
window.name = 'NG_DEFER_BOOTSTRAP!';
angular.element(document).ready(function() {
  angular.resumeBootstrap(moduleNames)
});
