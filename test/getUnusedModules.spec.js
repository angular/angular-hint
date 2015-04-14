var getUnusedModules = require('../src/modules/angular-hint-modules/getUnusedModules');

describe('getUnusedModules()', function() {
  it('should get unused modules', function() {
    var createdModules = {};
    createdModules['neverLoaded'] = {name: 'neverLoaded'};
    var res = getUnusedModules(createdModules);
    expect(res[0].message).toBe('Module "neverLoaded" was created but never loaded.');
  });
});