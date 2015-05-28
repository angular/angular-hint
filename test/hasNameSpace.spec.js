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
          ' to use lowerCamelCase. Check the name of "MyApp".' &&
          warningArray[2] === SEVERITY_SUGGESTION;
      });
    expect(formattingWarning.length).toBe(1);
  });
});
