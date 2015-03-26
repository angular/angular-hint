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
  });

  afterEach(function() {
    hintLog.flush();
  });

  it('should identify modules created and not loaded', function() {
    angular.module('createdAndNotLoaded', []);
    start();
    expect(hintLog.flush().Modules.warning[0]).toBe('Module "createdAndNotLoaded" was' +
      ' created but never loaded.');
  });


  it('should identify modules loaded that do not exist', function() {
    angular.module('testModule', ['doesntExist']);
    start();
    var log = hintLog.flush();
    expect(log.Modules.error[0]).toBe('Module "doesntExist" was loaded but' +
      ' does not exist.');
  });


  it('should identify modules that have been loaded multiple times', function() {
    angular.module('testModule', []);
    start();
    expect(hintLog.flush().Modules.warning[1]).toBe('Multiple modules with name ' +
      '"testModule" are being created and they will overwrite each other.');
  });


  it('should identify modules that have been loaded twice', function() {
    angular.module('moduleDuplicate', []);
    angular.module('moduleDuplicate', []);
    start();
    expect(hintLog.flush().Modules.warning[3]).toBe('Multiple modules with name ' +
      '"moduleDuplicate" are being created and they will overwrite each other.');
  });


  it('should ignore modules loaded twice if one is just being called', function() {
    angular.module('testModule2', []);
    angular.module('testModule2').controller('controller', [function(){}]);
    start();
    var log = hintLog.flush().Modules;
    var duplicateMessages = log.warning;
    expect(duplicateMessages).not.toContain('Multiple modules with name "testModule2" are being ' +
      'created and they will overwrite each other.');
  });


  it('should warn if modules are not named with lowerCamelCase or dotted.segments', function() {
    angular.module('testmodule', []);
    start();
    var log = hintLog.flush();
    expect(log.Modules.suggestion[0]).toBe('The best practice for' +
      ' module names is to use lowerCamelCase. Check the name of "testmodule".');

    angular.module('Testmodule', []);
    expect(hintLog.flush().Modules.suggestion[0]).toBe('The best practice for' +
      ' module names is to use lowerCamelCase. Check the name of "Testmodule".');
  });
});

describe('hintModules integration', function() {
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
    expect(hintLog.flush()['Modules']).not.toBeDefined();
  });
});
