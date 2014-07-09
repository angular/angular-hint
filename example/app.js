angular.module('sampleApp', ['ngRoute']).
      config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/example', {
          controller: 'SampleAppController',
          controllerAs: 'sampleAppCtrl',
          templateUrl: 'sampleApp.html'
        }).
        otherwise({redirectTo: '/example'});
  }]);
