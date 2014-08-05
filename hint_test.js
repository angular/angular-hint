describe('angularHint', function() {
  describe('angular hint bootstrapping', function() {

    beforeEach(function() {
      ptor = protractor.getInstance();
    });

    it('should warn if ng-hint is called with unknown options', function() {
      browser.get('includeWrongModuleName/');
      expect(element(by.id('console')).getText())
          .toBe('Angular Hint: GeneralWarning Messages:Module ngHintWrongModuleName could not be found');
      browser.get('excludeWrongModuleName/');
      expect(element(by.id('console')).getText())
          .toContain('Angular Hint: GeneralWarning Messages:Module ngHintExcludeWrongModuleName could not be found');
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
        'element does not exist in that scope.');
      //angular-hint-interpolation
      expect(element(by.id('console')).getText()).toContain('was found to be undefined in');
      //angular-hint-modules
      expect(element(by.id('console')).getText()).toContain('ModulesError Messages:ng-app may' +
        ' only be included once. The module "sampleAllHint" was not used to bootstrap' +
        ' because ng-app was already included');
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
        'element does not exist in that scope.');
      expect(element(by.id('console')).getText()).not.toContain('ng-repeat');
    });


    it('should warn if there is no ng-hint attribute', function() {
      browser.get('noHint/');
      expect(element(by.id('console')).getText())
        .toBe('Angular Hint: GeneralWarning Messages:ngHint is included on the page, but is not active because there is no `ng-hint` attribute present');
    });
  });
});
