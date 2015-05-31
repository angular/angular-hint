'use strict';

var hint = angular.hint;
describe('ngHintScopes', function() {

  var $rootScope;

  beforeEach(module('ngHintScopes'));
  beforeEach(inject(function(_$rootScope_) {
    $rootScope = _$rootScope_;
  }));

  describe('scope.$watch', function() {
    var scope;

    beforeEach(function() {
      scope = $rootScope.$new();
      scope.a = { b: 'hello' };
      spyOn(hint, 'emit');
    });

    it('should run perf timers for string expressions', function() {
      var calls = hint.emit.calls;
      scope.$watch('a.b', function() {});
      expect(calls.count()).toBe(0);

      scope.$apply();
      var evt = calls.mostRecent().args[1].events[0];
      expect(calls.count()).toBe(1);
      expect(evt.time).toEqual(jasmine.any(Number));
      evt.time = null
      expect(evt).toEqual({
        eventType: 'scope:watch',
        id: scope.$id,
        watch: 'a.b',
        time: null
      });

      scope.$apply();
      expect(calls.count()).toBe(2);
      var evt = calls.mostRecent().args[1].events[0];
      expect(evt.time).toEqual(jasmine.any(Number));
      evt.time = null
      expect(evt).toEqual({
        eventType: 'scope:watch',
        id: scope.$id,
        watch: 'a.b',
        time: null
      });

    });

    if (angular.version.minor >= 3) {
      it('should not run perf timers for one time bind expressions', function() {
        var calls = hint.emit.calls;
        scope.$watch('::a.b', function() {});
        expect(calls.count()).toBe(0);

        scope.$apply();
        var evt = calls.mostRecent().args[1].events[0];
        // this is the watch angular registers and deregisters on $$postDigest
        // for one time watch expressions
        expect(calls.count()).toBe(1);
        expect(evt.eventType).toBe('scope:watch');
        expect(evt.watch).toBe('oneTimeWatch');

        scope.$apply()
        var evt = calls.mostRecent().args[1].events[0];
        expect(calls.count()).toBe(2);
        expect(evt).toBeUndefined();
      });
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

  // describe('$rootScope.$apply', function() {
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
  // });

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
