'use strict';

var hint = angular.hint;

describe('hint', function() {

  afterEach(function() {
    expect(hint.flush()).toEqual({});
  });

  describe('log', function() {
    it('should add a new message to the message queue', function() {
      hint.log('Directives', 'An error', 1);
      expect(hint.flush()['Directives'].error).toEqual(['An error']);
    });


    it('should queue modules without a given name under General', function() {
      hint.log('','An error', 1);
      expect(hint.flush()['General'].error).toEqual(['An error']);
    });


    it('should queue modules without a given severity under Suggestion', function() {
      hint.log('','An error');
      expect(hint.flush()['General'].suggestion).toEqual(['An error']);
    });


    it('should prevent the logging of duplicate messages', function() {
      //Same error, only logged once
      hint.log('Directives', 'An error', 1);
      hint.log('Directives', 'An error', 1);
      expect(hint.flush()['Directives'].error.length).toBe(1);

      //Different errors, both logged
      hint.log('Directives', 'An error', 1);
      hint.log('Directives', 'An error part 2', 1);
      expect(Object.keys(hint.flush()['Directives'].error).length).toBe(2);

      //Different severities, both logged
      hint.log('Directives', 'An error', 1);
      hint.log('Directives', 'An error part 2', 2);
      var log = hint.flush();
      expect(Object.keys(log['Directives'].error).length).toBe(1);
      expect(Object.keys(log['Directives'].warning).length).toBe(1);

      hint.log('','An error', 1);
      hint.log('','An error', 1);
      expect(Object.keys(hint.flush()['General'].error).length).toBe(1);
    });
  });

  describe('flush', function() {
    it('should return the currently queued messages', function() {
      hint.log('', 'An error', 1);
      hint.log('', 'Another error', 1);
      var log = hint.flush();
      expect(log['General'].error).toEqual(['An error', 'Another error']);
    });


    it('should empty the queued messages', function() {
      hint.log('', 'An error', 1);
      hint.log('', 'Another error', 2);
      var log = hint.flush();
      expect(log['General'].error[0]).toEqual('An error');
      expect(log['General'].warning[0]).toEqual('Another error');
    });
  });

  describe('onMessage', function() {
    it('should be called whenever a message is added', function() {
      hint.onMessage = jasmine.createSpy('onMessage');
      hint.log('', 'An error', 1);
      expect(hint.onMessage).toHaveBeenCalledWith('General', 'An error', 'error', undefined);
      hint.flush();
    });
  });
});
