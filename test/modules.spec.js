var hintLog = angular.hint;
var start = require('../src/modules/angular-hint-modules/start');
var modData = require('../src/modules/angular-hint-modules/moduleData');

describe('hintModules', function() {
  beforeEach(function() {
    modData.createdModules = {
      'createdAndNotLoaded': {name:'createdAndNotLoaded', requires: []},
      'testModule': {name:'testModule', requires: []}
    };
    modData.loadedModules = {
      'doesntExist': 'doesntExist',
      'testModule': 'testModule'
    };
    modData.createdMulti = {
      'testModule': ['testModule']
    };
    spyOn(angular.hint, 'emit').and.callThrough();
  });

  it('should identify modules created and not loaded', function() {
    angular.module('createdAndNotLoaded', []);
    start();
    expect(angular.hint.emit).toHaveBeenCalledWith('Modules', 'Module "createdAndNotLoaded" was' +
      ' created but never loaded.', 2);
  });


  it('should identify modules loaded that do not exist', function() {
    angular.module('testModule', ['doesntExist']);
    start();
    expect(angular.hint.emit).toHaveBeenCalledWith('Modules', 'Module "doesntExist" was loaded but' +
      ' does not exist.', 1);
  });


  it('should identify modules that have been loaded multiple times', function() {
    angular.module('testModule', []);
    start();
    expect(angular.hint.emit).toHaveBeenCalledWith('Modules', 'Multiple modules with name ' +
      '"testModule" are being created and they will overwrite each other.', 2);
  });


  it('should identify modules that have been loaded twice', function() {
    angular.module('moduleDuplicate', []);
    angular.module('moduleDuplicate', []);
    start();
    expect(angular.hint.emit).toHaveBeenCalledWith('Modules', 'Multiple modules with name ' +
      '"moduleDuplicate" are being created and they will overwrite each other.', 2);
  });


  it('should ignore modules loaded twice if one is just being called', function() {
    angular.module('testModule2', []);
    angular.module('testModule2').controller('controller', [function(){}]);
    start();
    expect(angular.hint.emit).not.toHaveBeenCalledWith('Modules', 'Multiple modules with name "testModule2" are being ' +
      'created and they will overwrite each other.', 2);
  });

  it('should ignore modules loaded twice if one is being called without parameters', function() {
    angular.module('testModule3', []);
    angular.module('testModule3');
    start();
    expect(angular.hint.emit).not.toHaveBeenCalledWith('Modules', 'Multiple modules with name "testModule3" are ' +
      'being created and they will overwrite each other.', 2);
  });


  it('should warn if modules are not named with lowerCamelCase or dotted.segments', function() {
    angular.module('testmodule', []);
    start();
    expect(angular.hint.emit).toHaveBeenCalledWith('Modules', 'Module names should be namespaced' +
      ' with a dot (app.dashboard) or lowerCamelCase (appDashboard). Check the name of "testmodule".', 3);

    angular.module('Testmodule', []);
    expect(angular.hint.emit).toHaveBeenCalledWith('Modules', 'The best practice for' +
      ' module names is to use dot.case or lowerCamelCase. Check the name of "Testmodule".', 3);
  });
});

describe('hintModules integration', function() {
  beforeEach(function () {
    spyOn(angular.hint, 'emit').and.callThrough();
  });
  it('should not warn about itself or other ngHintModules', function() {

    // what is this i dont even
    modData.createdModules = {};
    modData.loadedModules = {};
    modData.createdMulti = {};

    // this blows other modules up sky high
    //angular.module('ngHintControllers', []);
    //angular.module('ngHintDirectives', []);
    //angular.module('ngHintDom', []);
    //angular.module('ngHintEvents', []);
    //angular.module('ngHintInterpolation', []);
    //angular.module('ngHintScopes', []);
    //angular.module('ng', []);
    //angular.module('ngLocale', []);

    start();
    expect(angular.hint.emit).not.toHaveBeenCalled();
  });
});
