var getNgAppMod = require('../src/modules/angular-hint-modules/getNgAppMod');
var hintLog = angular.hint;

describe('getNgAppMod()', function() {
  it('should return the value of the ng-app attribute', function() {
    var attributes = {
        'width': {value: '10px'},
        'id': {value: 'idName'},
        'ng-app': {value: 'testModule'}
    };
    var res = getNgAppMod(attributes);
    expect(res).toBe('testModule');
  });

  it('should log if multiple ng-apps are detected', function() {
    var attributes = {
        'width': {value: '10px'},
        'id': {value: 'idName'},
        'ng-app': {value: 'testModule'}
    };
    spyOn(angular.hint, 'emit').and.callThrough();
    var foundNgApp = getNgAppMod(attributes, false);
    getNgAppMod(attributes, foundNgApp);
    expect(angular.hint.emit).toHaveBeenCalledWith('Modules', 'ng-app may only be included once. The module ' +
      '"testModule" was not used to bootstrap because ng-app was already included.', 1);
  });
});