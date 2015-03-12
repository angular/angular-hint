'use strict';

var hintLog = angular.hint;

describe('hintEvents', function() {
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
    var elt = angular.element('<button ng-click="a.b.c()">Fake Increment</button>');
    $compile(elt)($rootScope);

    $rootScope.$digest();
    elt.triggerHandler('click');
    // TODO: fix this                                       'a' is undefined
    expect(angular.hint.log).toHaveBeenCalledWith('Events', 'a.b.c is undefined');
  });

  // TODO: implement this
  xit('should log a message if the path to handle an ng-event is not found', function() {
    var elt = angular.element('<button ng-click="a.b.c()">Fake Increment</button>');
    $compile(elt)($rootScope);
    $rootScope.a = {};

    $rootScope.$digest();
    elt.triggerHandler('click');
    expect(angular.hint.log).toHaveBeenCalledWith('Events', 'a.b is undefined');
  });



  it('should not break elements with more than one directive on them', function() {
    $rootScope.onBlur = jasmine.createSpy('onBlur');
    $rootScope.onFocus = jasmine.createSpy('onFocus');
    var elt = angular.element('<input type="text" ng-blur="onBlur()" ng-focus="onFocus()">');
    $compile(elt)($rootScope);
    $rootScope.$digest();

    var blurEvent = createEventMock('blur');
    var focusEvent = createEventMock('focus');
    elt[0].dispatchEvent(blurEvent);
    elt[0].dispatchEvent(focusEvent);

    expect($rootScope.onBlur).toHaveBeenCalled();
    expect($rootScope.onFocus).toHaveBeenCalled();
  });
});

function createEventMock (name) {
  var ev = document.createEvent('MouseEvent');
  ev.initMouseEvent(
    name, true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  return ev;
}
