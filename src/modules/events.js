'use strict';

/**
* Load necessary functions from /lib into variables.
*/
var ngEventAttributes = require('../lib/event-directives'),
    MODULE_NAME = 'Events';


var getFunctionNames = function(str) {
  if (typeof str !== 'string') {
    return [];
  }
  var results = str.replace(/\s+/g, '').split(/[\+\-\/\|\<\>\^=&!%~;]/g).map(function(x) {
    if (isNaN(+x)) {
      if (x.match(/\w+\(.*\)$/)){
        return x.substr(0, x.indexOf('('));
      }
      return x;
    }
  }).filter(function(x){
    return x;
  });
  return results;
};

/**
* Decorate $provide in order to examine ng-event directives
* and hint about their effective use.
*/
angular.module('ngHintEvents', [])
  .config(['$provide', function($provide) {
    for (var i = 0; i < ngEventAttributes.length; i++) {
      try {
        $provide.decorator(ngEventAttributes[i] + 'Directive',
            ['$delegate', '$parse', ngEventDirectivesDecorator(ngEventAttributes[i])]);
      } catch(e) {}
    }
  }]);

function ngEventDirectivesDecorator(ngEventAttrName) {
  return function ($delegate, $parse) {
    var originalCompileFn = $delegate[0].compile;

    $delegate[0].compile = function(element, attrs, transclude) {
      var linkFn = originalCompileFn.apply(this, arguments);

      return function ngEventHandler(scope, element, attrs) {
        var boundFuncs = getFunctionNames(attrs[ngEventAttrName]);
        boundFuncs.forEach(function(boundFn) {
          var property, propChain, lastProp = '';
          while((property = boundFn.match(/^.+?([^\.\[])*/)) !== null) {
            property = property[0];
            propChain = lastProp + property;
            if ($parse(propChain)(scope) === undefined) {
              angular.hint.emit(MODULE_NAME + ':undef', propChain + ' is undefined');
            }
            boundFn = boundFn.replace(property, '');
            lastProp += property;
            if(boundFn.charAt(0) === '.') {
              lastProp += '.';
              boundFn = boundFn.substr(1);
            }
          }
        });

        return linkFn.apply(this, arguments);
      };
    };
    return $delegate;
  }
}
