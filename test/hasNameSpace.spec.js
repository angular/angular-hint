var hasNameSpace = require('../src/modules/angular-hint-modules/hasNameSpace');
var hintLog = angular.hint;
var start = require('../src/modules/angular-hint-modules/start');

var SEVERITY_SUGGESTION = 3;

describe('hasNameSpace()', function() {
  beforeEach(function() {
    spyOn(hint, 'emit');
  });

  it('should check that a module has a correctly formatted name', function() {
    expect(hasNameSpace('MyApp')).toBe(false);
    expect(hasNameSpace('myapp')).toBe(false);
    expect(hasNameSpace('myApp')).toBe(true);
    expect(hasNameSpace('my.app')).toBe(true);
  });

  it('should warn about a non-namespaced module', function() {
    angular.module('app', []);
    start();
    var formattingWarning = angular.hint.emit.calls.allArgs()
      .filter(function(warningArray) {
        return warningArray[0] === 'Modules' &&
          warningArray[1] === 'Module names should be namespaced' +
      ' with a dot (app.dashboard) or lowerCamelCase (appDashboard). Check the name of "app".' &&
          warningArray[2] === SEVERITY_SUGGESTION;
      });
    expect(formattingWarning.length).toBe(1);
  });

  it('should only warn once about incorrect formatting for a module', function() {
    angular.module('MyApp', []);
    angular.module('MyApp');
    angular.module('MyApp');
    start();
    var formattingWarning = angular.hint.emit.calls.allArgs()
      .filter(function(warningArray) {
        return warningArray[0] === 'Modules' &&
          warningArray[1] === 'The best practice for module names is' +
          ' to use dot.case or lowerCamelCase. Check the name of "MyApp".' &&
          warningArray[2] === SEVERITY_SUGGESTION;
      });
    expect(formattingWarning.length).toBe(1);
  });
});
