'use strict';

var hintLog = angular.hint;

xdescribe('hintEvents', function() {
  var $rootScope,
      $compile,
      $controller;

  beforeEach(module('ngHintEvents'));
  beforeEach(inject(function(_$rootScope_, _$compile_, _$controller_) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $controller = _$controller_;
    spyOn(angular.hint, 'log').and.callThrough();
  }));

  it('should log a message if the path to handle an ng-event is not found', function() {
    var elm = angular.element('<button ng-click="a.b.c()">Fake Increment</button>');
    $compile(elm)($rootScope);

    $rootScope.$digest();
    elm.triggerHandler('click');
    expect(angular.hint.log).toHaveBeenCalledWith('a');
  });

  it('should log a message if the path to handle an ng-event is not found', function() {
    var elm = angular.element('<button ng-click="a.b.c()">Fake Increment</button>');
    $compile(elm)($rootScope);
    $rootScope.a = {};

    $rootScope.$digest();
    elm.triggerHandler('click');
    expect(angular.hint.log).toHaveBeenCalledWith('a.b');
  });


});