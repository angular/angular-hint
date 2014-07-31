describe('angularHint', function() {
  describe('angular hint bootstrapping', function() {

    beforeEach(function() {
      ptor = protractor.getInstance();
    });

    it('should warn if ng-hint is called with unknown options', function() {
      browser.get('includeWrongModuleName/');
      expect(element(by.id('console')).getText())
          .toBe('Angular Hint: GeneralModule ngHintWrongModuleName could not be found');
      browser.get('excludeWrongModuleName/');
      expect(element(by.id('console')).getText())
          .toContain('Angular Hint: GeneralModule ngHintExcludeWrongModuleName could not be found');
    });


    it('should include all modules by ng-hint default', function() {
      browser.get('allHint/');
      //angular-hint-controllers
      expect(element(by.id('console')).getText()).toContain('The best practice is to name ' +
        'controllers ending with \'Controller\'. Check the name of \'Hint\'');
      //angular-hint-directives
      expect(element(by.id('console')).getText()).toContain('ng-repeat');
      //angular-hint-dom
      expect(element(by.id('console')).getText()).toContain('getElementById');
      //angular-hint-events
      expect(element(by.id('console')).getText()).toContain('Variable "increment" called on DIV ' +
        'element does not exist in that scope. Event directive found on [object HTMLDivElement] ' +
        'in [object Object] scope');
      //angular-hint-interpolation
      expect(element(by.id('console')).getText()).toContain('was found to be undefined in');
      //angular-hint-modules
      expect(element(by.id('console')).getText()).toContain('Module "sampleAllHint" was created ' +
        'but never loaded.');
    });


    it('should have an inclusive mode', function() {
      browser.get('inclusiveHint/');
      expect(element(by.id('console')).getText())
        .toContain('getElementById');
    });


    it('should have an exclusive mode', function() {
      browser.get('exclusiveHint/');
      expect(element(by.id('console')).getText()).toContain('getElementById');
      expect(element(by.id('console')).getText()).toContain('Variable "increment" called on DIV ' +
        'element does not exist in that scope. Event directive found on [object HTMLDivElement] ' +
        'in [object Object] scope');
      expect(element(by.id('console')).getText()).not.toContain('ng-repeat');
    });


    it('should warn if there is no ng-hint attribute', function() {
      browser.get('noHint/');
      expect(element(by.id('console')).getText())
        .toBe('Angular Hint: GeneralngHint is included on the page, but is not active because there is no `ng-hint` attribute present');
    });
  });
});
