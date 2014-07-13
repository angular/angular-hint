describe('angularHint', function() {
  describe('angular hint bootstrapping', function() {
    // it('should warn if ng-hint is called with unknown options', function() {

    // });


    // it('should include all modules by ng-hint default', function() {

    // });


    it('should have an inclusive mode', function() {
      browser.get('http://localhost:8080/e2e/inclusiveHint');
      expect(element(by.id('title')).getText()).toBe('Inclusive Hint Example');
      expect(element(by.id('console')).getText().getText()).toBe('Angular best practices are to manipulate the DOM in the view. See: (https://github.com/angular/angular-hint-dom/blob/master/README.md) Expand to view manipulated properties and line numbers.');
    });


    // it('should have an exclusive mode', function() {

    // });

    // it('should not bootstrap if ng-hint is not included', function() {

    // });
  });
});