angular.module('sampleAllHint', ['ngRoute']).
      config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/allHint', {
          controller: 'AllController',
          controllerAs: 'allCtrl',
          templateUrl: 'allHint.html'
        }).
        otherwise({redirectTo: '/allHint'});
  }]);

