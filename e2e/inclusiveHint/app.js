angular.module('sampleInclusiveHint', ['ngRoute']).
      config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/inclusiveHint', {
          controller: 'HintController',
          controllerAs: 'hintCtrl',
          templateUrl: 'inclusiveHint.html'
        }).
        otherwise({redirectTo: '/inclusiveHint'});
  }]);


