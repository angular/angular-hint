'use strict';

var consoleText = require('./util.protractor');

describe('angularHint', function() {
  it('should warn if ng-hint is called with unknown options', function() {
    browser.get('include-wrong-module-name/');
    expect(consoleText())
        .toBe('Angular Hint: General; Warning; Module ngHintWrongModuleName could not be found;');
  });
});
