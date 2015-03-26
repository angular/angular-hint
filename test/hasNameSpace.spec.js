var hasNameSpace = require('../src/modules/angular-hint-modules/hasNameSpace');
var hintLog = angular.hint;

describe('hasNameSpace()', function() {
  afterEach(function() {
    hintLog.flush();
  });

  it('should check that a module has a correctly formatted name', function() {
    expect(hasNameSpace('MyApp')).toBe(false);
    expect(hasNameSpace('myapp')).toBe(false);
    expect(hasNameSpace('myApp')).toBe(true);
  });
});