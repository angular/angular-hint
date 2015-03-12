'use strict';

describe('angularHint', function() {
  it('should include all modules by ng-hint default', function() {
    browser.get('allHint/');

    //angular-hint-controllers
    expect(consoleText()).toContain('The best practice is to name ' +
      'controllers ending with \'Controller\'. Check the name of \'Hint\'');

    //angular-hint-directives
    expect(consoleText()).toContain('ng-repeat');

    //angular-hint-dom
    //expect(consoleText()).toContain('getElementById');

    //angular-hint-events
    //expect(consoleText()).toContain('Variable "increment" called on DIV ' +
    // 'element does not exist in that scope.');

    //angular-hint-interpolation
    //expect(consoleText()).toContain('was found to be undefined in');

    //angular-hint-modules
    expect(consoleText()).toContain('Angular Hint: Modules; ' +
        'Error; ' +
        'ng-app may only be included once. The module "sampleAllHint" was not used to bootstrap because ng-app was already included.;');
  });


  it('should have an inclusive mode', function() {
    browser.get('inclusiveHint/');
    //expect(consoleText())
    //  .toContain('getElementById');
  });

  // TODO: fix this assertion
  it('should have an exclusive mode', function() {
    browser.get('exclusiveHint/');
    //expect(consoleText()).toContain('getElementById');
    // expect(consoleText()).toContain('Variable "increment" called on DIV ' +
    //   'element does not exist in that scope.');
    expect(consoleText()).not.toContain('ng-repeat');
  });


  it('should warn if there is no ng-hint attribute', function() {
    browser.get('noHint/');
    expect(consoleText())
      .toBe('Angular Hint: General; Warning; ngHint is included on the page, but is not active because there is no `ng-hint` attribute present;');
  });

  function consoleText() {
    return element(by.id('console')).getText();
  }
});
