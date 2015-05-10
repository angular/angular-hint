var MODULE_NAME = 'Modules';

module.exports = function(modules) {
  modules.forEach(function(module) {
    angular.hint.emit(MODULE_NAME, module.message, module.severity);
  });
};
