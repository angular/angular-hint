angular.module('sampleExclusiveHint', ['ngRoute']).
      config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/exclusiveHint', {
          controller: 'ExclusiveController',
          controllerAs: 'exclusiveCtrl',
          templateUrl: 'exclusiveHint.html'
        }).
        otherwise({redirectTo: '/exclusiveHint'});
  }]);

