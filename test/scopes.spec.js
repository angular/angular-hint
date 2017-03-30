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
      describe('one-time expressions', function() {
        // Helpers
        function getDigestCallArgs() {
          var allArgs = hint.emit.calls.allArgs();
          var digestCallArgs = allArgs.filter(function(args) {
            return args[0] === 'scope:digest';
          });

          return digestCallArgs;
        }

        function countWatchEvents(args) {
          var events = args[1].events;
          var watchEvents = events.filter(function(evt) {
            return evt.eventType === 'scope:watch';
          });

          return watchEvents.length;
        }

        it('should correctly trigger perf timers when passed to `$watch`', function() {
          var calls = hint.emit.calls;
          var args;

          var reactions = [0, 0, 0];
          var exps = [
            '::c.d',
            '  ::c.d  ',
            '  ::  c.d  '
          ].forEach(function(exp, idx) {
            scope.$watch(exp, function(v) { reactions[idx]++; });
          });

          expect(calls.count()).toBe(0);

          scope.$apply();
          args = getDigestCallArgs();
          expect(args.length).toBe(1);
          expect(countWatchEvents(args[0])).toBe(6);   // Initial $digest: 2 loops
          expect(reactions).toEqual([1, 1, 1]);        // Initial $digest always calls listeners

          calls.reset();
          scope.$apply();
          args = getDigestCallArgs();
          expect(args.length).toBe(1);
          expect(countWatchEvents(args[0])).toBe(3);    // No change: 1 loop
          expect(reactions).toEqual([1, 1, 1]);         // No change: listeners not called

          calls.reset();
          scope.$apply('c.d = "foo"');
          args = getDigestCallArgs();
          expect(args.length).toBe(1);
          expect(countWatchEvents(args[0])).toBe(6);   // First change: 2 loops
          expect(reactions).toEqual([2, 2, 2]);        // First change to defined value calls listeners

          calls.reset();
          scope.$apply('c.d = "bar"');
          args = getDigestCallArgs();
          expect(args.length).toBe(1);
          expect(countWatchEvents(args[0])).toBe(0);   // Already settled: 0 loops
          expect(reactions).toEqual([2, 2, 2]);        // Already settled: listeners not called
        });

        it('should correctly trigger perf timers when used in template bindings', function() {
          var calls = hint.emit.calls;
          var args;

          $compile(
            '<div>' +
              // Interpolation in node text: 6 bindings (1 + 1 + 1 + 3)
              '<span>{{::c.d}}</span>' +
              '<span>{{  ::c.d  }}</span>' +
              '<span>{{  ::  c.d  }}</span>' +
              '<span>{{::c.d}}{{  ::c.d  }}{{  ::  c.d  }}</span>' +

              // Interpolation in attribute value: 6 bindings (1 + 1 + 1 + 3)
              '<span class="{{::c.d}}"></span>' +
              '<span class="{{  ::c.d  }}"></span>' +
              '<span class="{{  ::  c.d  }}"></span>' +
              '<span class="{{::c.d}}{{  ::c.d  }}{{  ::  c.d  }}"></span>' +

              // Expressions: 3 bindings (1 + 1 + 1)
              '<span ng-if="::c.d"></span>' +
              '<span ng-if="  ::c.d  "></span>' +
              '<span ng-if="  ::  c.d  "></span>' +

              // Total: 15 watchers (6 + 6 + 3)
            '</div>'
          )(scope);

          calls.reset();
          scope.$apply();
          args = getDigestCallArgs();
          expect(args.length).toBe(1);
          expect(countWatchEvents(args[0])).toBe(30);   // Initial $digest: 2 loops

          calls.reset();
          scope.$apply();
          args = getDigestCallArgs();
          expect(args.length).toBe(1);
          expect(countWatchEvents(args[0])).toBe(15);   // No change: 1 loop

          calls.reset();
          scope.$apply('c.d = "foo"');
          args = getDigestCallArgs();
          expect(args.length).toBe(1);
          expect(countWatchEvents(args[0])).toBe(30);   // First change: 2 loops

          calls.reset();
          scope.$apply('c.d = "bar"');
          args = getDigestCallArgs();
          expect(args.length).toBe(1);
          expect(countWatchEvents(args[0])).toBe(0);    // Already settled: 0 loops
        });
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
