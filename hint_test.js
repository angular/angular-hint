describe('angularHint', function() {
  describe('angular hint bootstrapping', function() {

    beforeEach(function() {
      ptor = protractor.getInstance();
    });

    it('should warn if ng-hint is called with unknown options', function() {
      browser.get('includeWrongModuleName/');
      expect(element(by.id('console')).getText())
          .toBe('Module ngHintWrongModuleName could not be found');
    });

    // TODO: uncomment these when other angular-hint modules besides hint-controllers
    //       are updated to use the new hint-log

    // it('should include all modules by ng-hint default', function() {
    //   browser.get('allHint/#/allHint');
    //   expect(element(by.id('title')).getText()).toBe('Angular Hint Example');
    //   expect(element(by.id('console')).getText()).toContain('Angular best practices are to manipulate the DOM in the view.');
    //   expect(element(by.id('console')).getText()).toContain('Directive');
    // });

    it('should have an inclusive mode', function() {
      browser.get('inclusiveHint/');
      expect(element(by.id('console')).getText())
        .toContain('getElementById');
    });

    it('should have an exclusive mode', function() {
      browser.get('exclusiveHint/');
      expect(element(by.id('console')).getText())
        .toContain('getElementById');
    });

    it('should warn if there is no ng-hint attribute', function() {
      browser.get('noHint/');
      expect(element(by.id('console')).getText())
        .toBe('Info: ngHint is included on the page, but is not active because there is no `ng-hint` attribute present');
    });
  });
});
