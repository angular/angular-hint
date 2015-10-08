var storeDependencies = require('./storeDependencies');

var seen = [];

var storeUsedModules = module.exports = function(module, modules){
  var name = module.name || module;
  if(module && seen.indexOf(name) === -1) {
    seen.push(name);
    storeDependencies(module);
    module.requires.forEach(function(modName) {
      var mod = modules[modName];
      storeUsedModules(mod, modules);
    });
  }
};