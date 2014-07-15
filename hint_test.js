describe('angularHint', function() {
  describe('angular hint bootstrapping', function() {

    beforeEach(function() {
      ptor = protractor.getInstance();
    });

    // it('should warn if ng-hint is called with unknown options', function() {

    // });

    // it('should include all modules by ng-hint default', function() {
    //   browser.get('http://localhost:8080/e2e/allHint/#/allHint');
    //   ptor.sleep(5000);
    //   expect(element(by.id('title')).getText()).toBe('Angular Hint Example');
    //   expect(element(by.id('console')).getText()).toContain('Angular best practices are to manipulate the DOM in the view.');
    //   expect(element(by.id('console')).getText()).toContain('Directive');
    // });

    it('should have an inclusive mode', function() {
      browser.get('http://localhost:8080/e2e/inclusiveHint');
      ptor.sleep(5000);
      expect(element(by.id('title')).getText()).toBe('Inclusive Hint Example');
      expect(element(by.id('console')).getText()).toContain('Angular best practices are to manipulate the DOM in the view.');
      expect(element(by.id('console')).getText()).not.toContain('Directive');
    });

    it('should have an exclusive mode', function() {
      browser.get('http://localhost:8080/e2e/exclusiveHint');
      ptor.sleep(5000);
      expect(element(by.id('title')).getText()).toBe('Exclusive Hint Example');
      expect(element(by.id('console')).getText()).not.toContain('Angular best practices are to manipulate the DOM in the view.');
      expect(element(by.id('console')).getText()).toContain('Directive');
    });

    it('should not add modules if ng-hint is not included', function() {
      browser.get('http://localhost:8080/e2e/noHint');
      ptor.sleep(5000);
      expect(element(by.id('title')).getText()).toBe('No Hint Example');
      expect(element(by.id('console')).getText()).not.toContain('Angular best practices are to manipulate the DOM in the view.');
      expect(element(by.id('console')).getText()).not.toContain('Directives');
    });
  });
});