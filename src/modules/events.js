'use strict';

/**
* Load necessary functions from /lib into variables.
*/
var ngEventAttributes = require('../lib/event-directives'),
    MODULE_NAME = 'Events';

/*
 * Remove string expressions except property accessors.
 * ex. abc["def"] = "gef"; // `removeStringExp` will remove "gef" but not "def".
 */
function removeStringExp(str) {
  return str.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g,
    function(match, pos, full) {
      // this is our lookaround code so that our regex doesn't become so
      // complicated.
      if (pos !== 0 && (match.length + pos) !== full.length &&
          full[pos - 1] === '[' && full[pos + match.length] === ']') {
           return match;
      }
      return '';
    });
}

var getFunctionNames = function(str) {
  if (typeof str !== 'string') {
    return [];
  }
  // There are still a bunch of corner cases here where we aren't going to be able to handle
  // but we shouldn't break the user's app and we should handle most common cases.
  // example of corner cases: we can't check for properties inside of function
  // arguments like `move(a.b.c)` with the current implementation
  // or property accessors with parentheses in them
  // like `prop["hello (world)"] = "test";`.
  // To fully fix these issues we would need a full blown expression parser.
  var results = removeStringExp(str.replace(/\s+/g, ''))
    .replace(/\(.*?\)/g, '')
    .split(/[\+\-\/\|\<\>\^=&!%~?:;]/g).map(function(x) {
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

        // guard against any parsing errors since the parsing code
        // to split the expression is pretty simple and naive.
        try {
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
        } catch (e) {
          angular.hint.emit(MODULE_NAME + ':undef', '' +
            'parsing error: please inform the angular-hint ' +
            'or batarang teams. expression: ' + boundFuncs.join(''));
        }

        return linkFn.apply(this, arguments);
      };
    };
    return $delegate;
  }
}
