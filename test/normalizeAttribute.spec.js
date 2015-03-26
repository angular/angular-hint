var normalizeAttribute = require('../src/modules/angular-hint-modules/normalizeAttribute');

describe('normalizeAttribute()', function() {
  it('should normalize attribute by stripping optional parameters', function() {
    var testAttrs = ['data:ng-click','x:ng:src','ng:href'];
    testAttrs = testAttrs.map(function(x){return normalizeAttribute(x);});
    expect(testAttrs[0]).toBe('ng-click');
    expect(testAttrs[1]).toBe('ng-src');
    expect(testAttrs[2]).toBe('ng-href');
  });
});
