angular.module('sampleNoHint', ['ngRoute']).
      config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/noHint', {
          controller: 'NoController',
          controllerAs: 'noCtrl',
          templateUrl: 'noHint.html'
        }).
        otherwise({redirectTo: '/noHint'});
  }]);