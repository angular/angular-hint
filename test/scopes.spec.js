'use strict';

var hint = angular.hint;
describe('ngHintScopes', function() {

  var $rootScope, $compile;

  beforeEach(module('ngHintScopes'));
  beforeEach(inject(function(_$rootScope_, _$compile_) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
  }));

  describe('scope.$watch', function() {
    var scope;

    beforeEach(function() {
      scope = $rootScope.$new();
      scope.a = { b: 'hello' };
      spyOn(hint, 'emit');
    });

    it('should run perf timers for string expressions', function() {
      scope.$watch('a.b', function() {});
      expect(hint.emit.calls.count()).toBe(0);

      scope.$apply();
      var expectedEvent = {
        eventType: 'scope:watch',
        id: scope.$id,
        watch: 'a.b',
        time: null
      };
      checkMostRecentCall(1, expectedEvent);
      scope.$apply();
      checkMostRecentCall(2, expectedEvent);
    });

    it('should handle null watchExpression', function() {
      scope.$watch(null, function() {});
      expect(hint.emit.calls.count()).toBe(0);

      scope.$apply();
      var expectedEvent = {
        eventType: 'scope:watch',
        id: scope.$id,
        watch: null,
        time: null
      };
      checkMostRecentCall(1, expectedEvent);
      scope.$apply();
      checkMostRecentCall(2, expectedEvent);
    });

    it('should not break when watchAction is called without context', function() {
      var _watch = scope.$watch;
      scope.$watch = function(watchExpression, watchAction) {
        var contextlessWatchAction = watchAction.bind(undefined);
        return _watch.call(scope, watchExpression, contextlessWatchAction);
      };

      scope.$watch('a.b', function(newValue) {});
      expect(hint.emit.calls.count()).toBe(0);

      scope.$digest();
      checkMostRecentCall(1, {
        eventType: 'scope:reaction',
        id: scope.$id,
        watch: 'a.b',
        time: null
      }, 1);
    });

    if (angular.version.minor >= 3) {
      it('should not run perf timers for one time bind expressions passed to watch', function() {
        var calls = hint.emit.calls;
        scope.$watch('::a.b', function() {});
        expect(calls.count()).toBe(0);

        scope.$apply();
        var evt = calls.mostRecent().args[1].events[0];
        expect(calls.count()).toBe(1);
        expect(evt).toBeUndefined();
      });

      it('should not run perf timers for one time template bindings', function() {
        var elt = angular.element(
          '<div>' +
          '<span>{{::a}}</span>' +
          '<button ng-click="a = \'bar\'">Set</button>' +
          '</div>'
        );
        scope.a = 'foo';
        var view = $compile(elt)(scope);
        scope.$apply();
        var $binding = view.find('span');
        var $button = view.find('button');

        $button.triggerHandler('click');
        scope.$apply();
        expect($binding.text()).toBe('foo');
      });
    }

    // the event's time property is set to null before comparison with expectedEvent, so callers
    // should set the time property on expectedEvent to null as well
    function checkMostRecentCall(expectedCount, expectedEvent, eventIdx){
      var calls = hint.emit.calls;
      var evt = calls.mostRecent().args[1].events[eventIdx || 0];
      expect(calls.count()).toBe(expectedCount);
      expect(evt.time).toEqual(jasmine.any(Number));
      evt.time = null;
      expect(evt).toEqual(expectedEvent);
    }
  });

  // TODO: revisit this when I figure out a good way to make this
  //       perform; see: https://github.com/angular/angular-hint-scopes/issues/2
  // describe('$rootScope.$watch', function() {
  //   it('should not fire on registration', function() {
  //     spyOn(hint, 'emit');
  //     $rootScope.$watch('hi');

  //     expect(hint.emit).not.toHaveBeenCalled();
  //   });

  //   it('should fire on digest', function() {
  //     spyOn(hint, 'emit');
  //     $rootScope.$watch('hi');
  //     $rootScope.$apply();

  //     expect(hint.emit).toHaveBeenCalled();
  //     var args = getArgsOfNthCall(0);

  //     expect(args[0]).toBe('scope:watch');
  //     expect(args[1].id).toBe($rootScope.$id);
  //   });

  //   it('should fire on digest', function() {
  //     spyOn(hint, 'emit');
  //     $rootScope.$watch('hi');
  //     $rootScope.$apply();

  //     var args = getArgsOfNthCall(0);
  //     expect(hint.emit).toHaveBeenCalled();
  //     expect(args[0]).toBe('scope:watch');
  //     expect(args[1].watch).toBe('hi');
  //     expect(args[1].id).toBe($rootScope.$id);
  //   });
  // });

  describe('$rootScope.$new', function() {
    it('should fire a message when called', function() {
      spyOn(hint, 'emit');
      var scope = $rootScope.$new();
      var args = getArgsOfNthCall(0);

      expect(args[0]).toBe('scope:new');
      expect(args[1].parent).toBe($rootScope.$id);
      expect(args[1].child).toBe(scope.$id);
    });
  });

  describe('$rootScope.$destroy', function() {
    it('should fire a message when called', function() {
      var scope = $rootScope.$new();

      spyOn(hint, 'emit');
      scope.$destroy();
      var args = getArgsOfNthCall(0);

      expect(args[0]).toBe('scope:destroy');
      expect(args[1].id).toBe(scope.$id);
    });
  });

  describe('$rootScope.$apply', function() {
    beforeEach(function () {
      jasmine.clock().install();
    });

    afterEach(function() {
      jasmine.clock().uninstall();
    });

    //   it('should fire a message when called', function() {
    //     var scope = $rootScope.$new();
    //     spyOn(hint, 'emit');

    //     scope.$apply();

    //     expect(hint.emit).toHaveBeenCalled();
    //     var args = hint.emit.calls[1].args;

    //     expect(args[0]).toBe('scope:apply');
    //     expect(args[1].id).toBe(scope.$id);
    //     expect(args[1].time).toBeDefined();
    //   });

    it('should cause model:change events to be emitted for all paths on current scope', function() {
      var scope = $rootScope.$new();
      scope.a = { b: { c: 1 } };
      hint.watch(scope.$id, 'a.b.c');
      jasmine.clock().tick(10);
      spyOn(hint, 'emit');
      scope.a.b.c = 2;
      scope.$apply();
      jasmine.clock().tick(10);

      expect(hint.emit.calls.count()).toEqual(3);

      var args = getArgsOfNthCall(0);
      expect(args[0]).toBe('scope:digest');

      args = getArgsOfNthCall(1);
      expect(args[0]).toBe('model:change');
      expect(args[1]).toEqual({
        id : scope.$id,
        path : 'a.b',
        oldValue : '{"c":1}',
        value : '{"c":2}'
      });

      args = getArgsOfNthCall(2);
      expect(args[0]).toBe('model:change');
      expect(args[1]).toEqual({
        id : scope.$id,
        path : 'a.b.c',
        oldValue : 1,
        value : 2
      });
    });

    it('should cause model:change events to be emitted for all other watched scopes', function() {
      var parentScope = $rootScope.$new();
      var targetScope = parentScope.$new();
      var childScope = targetScope.$new();
      var siblingScope = parentScope.$new();

      parentScope.a = 1;
      childScope.b = 1;
      siblingScope.c = 1;

      hint.watch(parentScope.$id, 'a');
      hint.watch(childScope.$id, 'b');
      hint.watch(siblingScope.$id, 'c');
      jasmine.clock().tick(10);
      spyOn(hint, 'emit');
      parentScope.a = 2;
      childScope.b = 2;
      siblingScope.c = 2;
      targetScope.$apply();
      jasmine.clock().tick(10);

      expect(hint.emit.calls.count()).toEqual(4);

      var args = getArgsOfNthCall(0);
      expect(args[0]).toBe('scope:digest');

      args = getArgsOfNthCall(1);
      expect(args[0]).toBe('model:change');
      expect(args[1]).toEqual({
        id : parentScope.$id,
        path : 'a',
        oldValue : 1,
        value : 2
      });

      args = getArgsOfNthCall(2);
      expect(args[0]).toBe('model:change');
      expect(args[1]).toEqual({
        id : childScope.$id,
        path : 'b',
        oldValue : 1,
        value : 2
      });

      args = getArgsOfNthCall(3);
      expect(args[0]).toBe('model:change');
      expect(args[1]).toEqual({
        id : siblingScope.$id,
        path : 'c',
        oldValue : 1,
        value : 2
      });
    });

    it('should maintain the data type of the $id for the current angular version', function() {
      var targetScope = $rootScope.$new();
      targetScope.a = 1;
      hint.watch(targetScope.$id, 'a');
      jasmine.clock().tick(10);
      spyOn(hint, 'emit');
      targetScope.a = 2;

      targetScope.$apply();
      jasmine.clock().tick(10);

      var args = getArgsOfNthCall(1);
      expect(args[0]).toBe('model:change');

      // expect strings for angular 1.2, integers for 1.3+
      expect(args[1].id).toBe(targetScope.$id);
    });
  });

  describe('hint.watch', function() {
    var scope;

    beforeEach(function () {
      scope = $rootScope.$new();
      scope.a = { b: { c: 1 } };
      spyOn(hint, 'emit');
      jasmine.clock().install();
    });

    afterEach(function() {
      jasmine.clock().uninstall();
    });

    it('should emit when registering a watch', function() {
      hint.watch(scope.$id, 'a.b.c');
      jasmine.clock().tick(10);

      expect(hint.emit).toHaveBeenCalled();

      var args = getArgsOfNthCall(0);

      expect(args[0]).toBe('model:change');
      expect(args[1]).toEqual({
        id : scope.$id,
        path : 'a',
        value : '{"b":{"~object":true}}'
      });

      args = getArgsOfNthCall(1);

      expect(args[0]).toBe('model:change');
      expect(args[1]).toEqual({
        id : scope.$id,
        path : 'a.b',
        value : '{"c":1}'
      });

      args = getArgsOfNthCall(2);

      expect(args[0]).toBe('model:change');
      expect(args[1]).toEqual({
        id : scope.$id,
        path : 'a.b.c',
        value : 1
      });

    });

    it('should emit when a watched model changes', function() {
      hint.watch(scope.$id, 'a.b.c');
      scope.a.b.c = 2;
      scope.$apply();

      jasmine.clock().tick(10);

      expect(hint.emit).toHaveBeenCalled();
      var args = getArgsOfNthCall(4);
      expect(args[0]).toBe('model:change');

      expect(args[1]).toEqual({
        id : scope.$id,
        path : 'a.b',
        oldValue: '{"c":1}',
        value : '{"c":2}'
      });

      args = getArgsOfNthCall(5);
      expect(args[0]).toBe('model:change');

      expect(args[1]).toEqual({
        id : scope.$id,
        path : 'a.b.c',
        oldValue: 1,
        value : 2
      });
    });

    it('should accept an id as a string and return the id in the data type the current angular version uses', function() {
      hint.watch('' + scope.$id, '');

      expect(hint.emit).toHaveBeenCalled();

      var args = getArgsOfNthCall(0);
      expect(args[0]).toBe('model:change');
      expect(args[1].id).toBe(scope.$id);
    });
  });


  describe('hint.assign', function() {
    var scope;

    beforeEach(function () {
      scope = $rootScope.$new();
      scope.a = { b: { c: 1 } };
    });

    it('should change values on a scope', function() {
      hint.assign(scope.$id, 'a.b.c', 2);

      expect(scope.a.b.c).toBe(2);
    });
  });

});

function getArgsOfNthCall(n) {
  n = n || 0;
  return hint.emit.calls.argsFor(n);
}
