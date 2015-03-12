'use strict';

var consoleText = require('./util.protractor');

describe('angularHint', function() {
  it('should warn if ng-hint is called with unknown options', function() {
    browser.get('exclude-wrong-module-name/');
    expect(consoleText())
        .toContain('Angular Hint: General; Warning; Module ngHintExcludeWrongModuleName could not be found;');
  });
});
