var hintLog = angular.hint = require('./log'),
    MODULE_NAME = 'Modules',
    SEVERITY_SUGGESTION = 3;

module.exports = function(str) {
  if (str === 'ng') {
    return true;
  }

  if(str.toLowerCase() === str || str.charAt(0).toUpperCase() === str.charAt(0)) {
    hintLog.log(MODULE_NAME, 'The best practice for' +
      ' module names is to use lowerCamelCase. Check the name of "' + str + '".',
      SEVERITY_SUGGESTION);
    return false;
  }
  return true;
};
