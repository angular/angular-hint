'use strict';

/**
* Load necessary functions from /lib into variables.
*/
var EVENT_NAMES = require('../event-directives');

var provider = require('../debug-parse');
var err = null;
provider.onUndefined(function (text) {
  if (!err) {
    err = text;
  }
});
var constructor = new provider();

var debugParse = null

/**
* Decorate $provide in order to examine ng-event directives
* and hint about their effective use.
*/
angular.module('ngHintEvents', [])
  .config(['$provide', function($provide) {
    EVENT_NAMES.forEach(function (eventName) {
      var directiveName = eventToDirectiveName(eventName);
      // new versions of angular include event directives that older versions do not
      try {
        $provide.decorator(directiveName, ['$delegate', '$parse', '$filter', '$sniffer',
              hintDirectiveDecoratorFactory(eventName)]);
      } catch(e) {}
    });
  }]);

var debugParseInstance = null;
var forceAsyncEvents = {
  'blur': true,
  'focus': true
};
function hintDirectiveDecoratorFactory(eventName) {
  var attrName = eventToAttrName(eventName);
  return function hintDirectiveDecorator($delegate, $parse, $filter, $sniffer) {
    var original = $delegate[0].compile,
                   falseBinds = [],
                   messages = [];

    if (!debugParseInstance) {
      debugParseInstance = constructor.$get[2]($filter, $sniffer);
    }

    $delegate[0].compile = function($element, attr) {
      // We expose the powerful $event object on the scope that provides access to the Window,
      // etc. that isn't protected by the fast paths in $parse.  We explicitly request better
      // checks at the cost of speed since event handler expressions are not executed as
      // frequently as regular change detection.
      var fn = debugParseInstance(attr[eventToAttrName(eventName)], /* interceptorFn */ null, /* expensiveChecks */ true);
      return function ngEventHandler(scope, element) {
        element.on(eventName, function(event) {
          var callback = function() {
            err = null;
            fn(scope, {$event: event});
            if (err) {
              angular.hint.log(err);
            }
          };
          if (forceAsyncEvents[eventName] && $rootScope.$$phase) {
            scope.$evalAsync(callback);
          } else {
            scope.$apply(callback);
          }
        });
      };
    };

    return $delegate;
  }
}


function eventToDirectiveName(eventName) {
  return eventToAttrName(eventName) + 'Directive';
}

function eventToAttrName(eventName) {
  return 'ng' + eventName[0].toUpperCase() + eventName.substr(1);
}
