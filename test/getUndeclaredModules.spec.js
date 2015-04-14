var getUndeclaredModules = require('../src/modules/angular-hint-modules/getUndeclaredModules');

describe('getUndeclaredModules()', function() {
  it('should get undeclared modules', function() {
    var loadedModules = {};
    loadedModules['neverDeclared'] = 'neverDeclared';
    var res = getUndeclaredModules(loadedModules);
    expect(res[0].message).toBe('Module "neverDeclared" was loaded but does not exist.');
  });
});
