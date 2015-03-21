var modData = require('./moduleData');

module.exports = function(module, isNgAppMod) {
  var name = module.name || module;
  if(!isNgAppMod){
    module.requires.forEach(function(dependency){
      modData.loadedModules[dependency] = dependency;
    });
  }
  else {
    modData.loadedModules[name] = name;
    modData.ngAppMod = name;
  }
};
