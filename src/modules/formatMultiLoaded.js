var modData = require('./moduleData');
  MODULE_NAME = 'Modules',
  SEVERITY_WARNING = 2;

module.exports = function() {
  var multiLoaded = [];
  for(var modName in modData.createdMulti) {
    var message = 'Multiple modules with name "' + modName + '" are being created and they will ' +
      'overwrite each other.';
    var multi = modData.createdMulti[modName];
    var multiLength = multi.length;
    var details = {
      existingModule: multi[multiLength - 1],
      overwrittenModules: multi.slice(0, multiLength - 1)
    };
    multiLoaded
      .push({module: details, message: message, name: MODULE_NAME, severity: SEVERITY_WARNING});
  }
  return multiLoaded;
};
