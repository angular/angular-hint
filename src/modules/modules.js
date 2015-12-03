'use strict';

var getModule = require('./angular-hint-modules/getModule'),
    start = require('./angular-hint-modules/start'),
    storeNgAppAndView = require('./angular-hint-modules/storeNgAppAndView'),
    storeUsedModules = require('./angular-hint-modules/storeUsedModules'),
    hasNameSpace = require('./angular-hint-modules/hasNameSpace'),
    modData = require('./angular-hint-modules/moduleData');

var doc = Array.prototype.slice.call(document.getElementsByTagName('*')),
    originalAngularModule = angular.module,
    modules = {};

storeNgAppAndView(doc);

angular.module = function(name, requiresOriginal) {
  var module = originalAngularModule.apply(this, arguments),
      name = module.name;

  module.requiresOriginal = requiresOriginal;
  modules[name] = module;
  var modToCheck = getModule(name, true);
  //check arguments to determine if called as setter or getter
  var modIsSetter = arguments.length > 1;

  if (modIsSetter) {
    hasNameSpace(name);
  }

  if(modToCheck && modToCheck.requiresOriginal !== module.requiresOriginal && modIsSetter) {
    if(!modData.createdMulti[name]) {
      modData.createdMulti[name] = [getModule(name,true)];
    }
    modData.createdMulti[name].push(module);
  }
  modData.createdModules[name] = module;
  return module;
};

angular.module('ngHintModules', []).config(function() {
  var ngAppMod = modules[modData.ngAppMod];
  if (ngAppMod) {
    storeUsedModules(ngAppMod, modules);
  }
  start();
});
