angular.module('sampleApp', ['ngRoute']).
      config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/training', {
          controller: 'SampleAppController',
          controllerAs: 'sampleAppCtrl',
          templateUrl: 'sampleApp.html'
        }).
        otherwise({redirectTo: '/training'});
  }]);
