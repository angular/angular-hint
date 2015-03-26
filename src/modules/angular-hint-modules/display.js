var hintLog = angular.hint = require('./../log'),
    MODULE_NAME = 'Modules';

module.exports = function(modules) {
  modules.forEach(function(module) {
    hintLog.log(MODULE_NAME, module.message, module.severity);
  });
};
