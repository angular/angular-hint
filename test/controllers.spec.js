'use strict';

var SEVERITY_ERROR = 1,
    SEVERITY_WARNING = 2;

describe('controllerDecorator', function() {
  var $controller, $compile, $controllerProvider, $rootScope;

  beforeEach(module('ngHintControllers'));
  beforeEach(module(function (_$controllerProvider_) {
    $controllerProvider = _$controllerProvider_;
  }));

  beforeEach(inject(function(_$controller_, _$rootScope_, _$compile_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    spyOn(angular.hint, 'emit').and.callThrough();
  }));


  afterEach(function () {
    delete window.MockController;
  });

  function MockController() {
    var element = document.createElement('a');
    element.innerHTML = 'testValue';
  }

  it('should detect if angular uses a global function as a controller', function() {
    window.MockController = MockController;
    try {
      var sampleControl = $controller('MockController');
    } catch (e) {};

    if (angular.version.minor < 3) {
      expect(angular.hint.emit).toHaveBeenCalledWith('Controllers:global', 'add `MockController` to a module', SEVERITY_WARNING,
          'Using global functions as controllers is against Angular best practices and depricated in Angular 1.3 and up');
    } else {
      expect(angular.hint.emit).toHaveBeenCalledWith('Controllers:global', 'add `MockController` to a module', SEVERITY_ERROR,
          'Using global functions as controllers is against Angular best practices and depricated in Angular 1.3 and up');
    }
  });


  it('should work with controllerAs', function() {
    var scope = $rootScope.$new();
    $controllerProvider.register('SampleController', function() {
      this.message = 'greetings';
    });
    var elm = angular.element('<div ng-controller="SampleController as ctrl">' +
                                '{{ctrl.message}}' +
                              '</div>');
    expect(function () {
      $compile(elm)(scope);
      $rootScope.$apply();
    }).not.toThrow();
  });


  it('should not warn about angular internal controllers used on the window', function() {
    var scope = $rootScope.$new();
    $controllerProvider.register('SampleController', function($scope) {
      $scope.types = [
        { name: 'Controllers', isChecked: false},
        { name: 'Directives', isChecked: false},
        { name: 'DOM', isChecked: false},
        { name: 'Events', isChecked: false},
        { name: 'Interpolation', isChecked: false},
        { name: 'Modules', isChecked: false}
      ];
    });
    var ctrl = $controller('SampleController', {$scope: scope});
    var elm = angular.element('<div ng-controller="SampleController">' +
                                '<span ng-repeat="type in types">' +
                                  '<input  type="checkbox" id="{{type.name}}" ng-click="changeList()" ng-model="type.isChecked">' +
                                    '{{type.name}}' +
                                '</span>' +
                                '<form></form>' +
                              '</div>');
    $compile(elm)(scope);
    $rootScope.$digest();
    expect(angular.hint.emit).not.toHaveBeenCalled();
  });


  it('should allow the instantiation of global controller functions', function() {
    if (angular.version.minor >= 3) {
      return;
    }

    var scope = $rootScope.$new();

    window.GlobalFunction = function GlobalFunction($scope) {
      $scope.types = [
        { name: 'Controllers', isChecked: false},
        { name: 'Directives', isChecked: false},
        { name: 'DOM', isChecked: false},
        { name: 'Events', isChecked: false},
        { name: 'Interpolation', isChecked: false},
        { name: 'Modules', isChecked: false}
      ];
    };

    expect(function () {
      var ctrl = $controller('GlobalFunction', {$scope: scope});
    }).not.toThrow();

    var elm = angular.element('<div ng-controller="GlobalFunction">' +
                                '<span ng-repeat="type in types">' +
                                  '<input  type="checkbox" id="{{type.name}}" ng-click="changeList()" ng-model="type.isChecked">' +
                                    '{{type.name}}' +
                                '</span>' +
                                '<form></form>' +
                              '</div>');
    expect(function() {
      $compile(elm)(scope);
      $rootScope.$digest();
    }).not.toThrow();

    delete window.GlobalFunction;
  });


  it('should warn about the names of global controller functions', function() {
    if (angular.version.minor >= 3) {
      return;
    }
    var scope = $rootScope.$new();
    window.globalFunction = function globalFunction($scope) {
      $scope.types = [
          { name: 'Controllers', isChecked: false},
          { name: 'Directives', isChecked: false},
          { name: 'DOM', isChecked: false},
          { name: 'Events', isChecked: false},
          { name: 'Interpolation', isChecked: false},
          { name: 'Modules', isChecked: false}
        ];
    }
    var ctrl = $controller('globalFunction', {$scope: scope});
    var elm = angular.element('<div ng-controller="globalFunction">' +
                                '<span ng-repeat="type in types">' +
                                  '<input  type="checkbox" id="{{type.name}}" ng-click="changeList()" ng-model="type.isChecked">' +
                                    '{{type.name}}' +
                                '</span>' +
                                '<form></form>' +
                              '</div>');
    $compile(elm)(scope);
    $rootScope.$digest();
    expect(angular.hint.emit).toHaveBeenCalledWith('Controllers:rename',
        'Consider renaming `globalFunction` to `GlobalFunctionController`.',
        SEVERITY_WARNING,
        'Name controllers according to best practices');

    delete window.globalFunction;
  });


  it('should throw if the controller cannot be created', function() {
    var scope = $rootScope.$new();
    expect(function() {
      var ctrl = $controller('NotTheGlobalFunction', {$scope: scope});
    }).toThrow();
  });


  it('should not log a message if the controller is on the local scope', function() {
    $controllerProvider.register('SampleController', function() {});
    $controller('SampleController');

    expect(angular.hint.emit).not.toHaveBeenCalledWith('Controllers', 'It is against Angular' +
      'best practices to instantiate a controller on the window. This behavior is deprecated in' +
      ' Angular 1.3.0', (angular.version.minor < 3 ? SEVERITY_WARNING : SEVERITY_ERROR));
  });


  it('should warn if a controller name does not begin with an uppercase letter', function(){
    $controllerProvider.register('sampleController', function() {});
    $controller('sampleController');
    expect(angular.hint.emit).toHaveBeenCalledWith('Controllers:rename',
        'Consider renaming `sampleController` to `SampleController`.',
        SEVERITY_WARNING,
        'Name controllers according to best practices');
  });

  it('should only warn once about formatting of controller name', function() {
    $controllerProvider.register('sampleController', function() {});
    $controller('sampleController');
    $controller('sampleController');
    var formattingWarning = angular.hint.emit.calls.allArgs()
      .filter(function(warningArray) {
        return warningArray[0] === 'Controllers:rename' &&
          warningArray[1] ===  'Consider renaming `sampleController`' +
          ' to `SampleController`.' &&
          warningArray[2] === SEVERITY_WARNING;
      });
    expect(formattingWarning.length).toBe(1);
  });


  it('should not warn if a controller name begins with an uppercase letter', function(){
    $controllerProvider.register('SampleController', function() {});
    $controller('SampleController');
    expect(angular.hint.emit).not.toHaveBeenCalled();
  });


  it('should warn if a controller name does not include Controller', function(){
    $controllerProvider.register('Sample', function() {});
    $controller('Sample');
    expect(angular.hint.emit).toHaveBeenCalledWith('Controllers:rename',
        'Consider renaming `Sample` to `SampleController`.',
        SEVERITY_WARNING,
        'Name controllers according to best practices');
  });


  it('should warn if a controller name does not end with Controller', function(){
    $controllerProvider.register('SampleControllerYay', function() {});
    $controller('SampleControllerYay');
    expect(angular.hint.emit).toHaveBeenCalledWith('Controllers:rename',
        'Consider renaming `SampleControllerYay` to `SampleControllerYayController`.',
        SEVERITY_WARNING,
        'Name controllers according to best practices');
  });


  it('should not warn if a controller ends with Controller', function(){
    $controllerProvider.register('SampleController', function() {});
    $controller('SampleController');
    expect(angular.hint.emit).not.toHaveBeenCalled();
  });
});


describe('module.controller', function() {
  var $controller, $compile, $rootScope;

  beforeEach(module('ngHintControllers'));
  beforeEach(function() {
    spyOn(angular.hint, 'emit').and.callThrough();
  });

  it('should accept name and constructor as separate arguments', function() {
    angular.module('sampleApp', []).controller('SampleController', angular.noop);
    expect(angular.hint.emit).not.toHaveBeenCalled();

    angular.module('sampleApp', []).controller('sampleController', angular.noop);
    expect(angular.hint.emit).toHaveBeenCalled();
    expect(angular.hint.emit.calls.count()).toBe(1);
  });


  it('should accept a map of name/constructor pairs', function() {
    angular.module('sampleApp', []).controller({
      'SampleController': angular.noop,
      'sampleController': angular.noop
    });
    expect(angular.hint.emit).toHaveBeenCalled();
    expect(angular.hint.emit.calls.count()).toBe(1);
  });
});
