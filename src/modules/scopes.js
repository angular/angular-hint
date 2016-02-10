'use strict';

var summarize = require('../lib/summarize-model');
var debounceOn = require('debounce-on');

var hint = angular.hint;

hint.emit = hint.emit || function () {};

module.exports = angular.module('ngHintScopes', []).config(['$provide', function ($provide) {
  $provide.decorator('$rootScope', ['$delegate', '$parse', decorateRootScope]);
  $provide.decorator('$compile', ['$delegate', decorateDollaCompile]);
}]);

function decorateRootScope($delegate, $parse) {

  var perf = window.performance || { now: function () { return 0; } };

  var scopes = {},
      watching = {};

  var debouncedEmitModelChange = debounceOn(emitModelChange, 10);

  hint.watch = function (scopeId, path) {
    path = typeof path === 'string' ? path.split('.') : path;

    if (!watching[scopeId]) {
      watching[scopeId] = {};
    }

    for (var i = 1, ii = path.length; i <= ii; i += 1) {
      var partialPath = path.slice(0, i).join('.');
      if (watching[scopeId][partialPath]) {
        continue;
      }
      var get = gettterer(scopeId, partialPath);
      var value = summarize(get());
      watching[scopeId][partialPath] = {
        get: get,
        value: value
      };
      hint.emit('model:change', {
        id: convertIdToOriginalType(scopeId),
        path: partialPath,
        value: value
      });
    }
  };

  hint.assign = function (scopeId, path, value) {
    var scope;
    if (scope = scopes[scopeId]) {
      scope.$apply(function () {
        return $parse(path).assign(scope, value);
      });
    }
  };

  hint.inspectScope = function (scopeId) {
    var scope;
    if (scope = scopes[scopeId]) {
      window.$scope = scope;
    }
  };

  hint.unwatch = function (scopeId, unwatchPath) {
    Object.keys(watching[scopeId]).
      forEach(function (path) {
        if (path.indexOf(unwatchPath) === 0) {
          delete watching[scopeId][path];
        }
      });
  };

  var scopePrototype = ('getPrototypeOf' in Object) ?
      Object.getPrototypeOf($delegate) : $delegate.__proto__;

  var _watch = scopePrototype.$watch;
  var _digestEvents = [];
  var skipNextPerfWatchers = false;
  scopePrototype.$watch = function (watchExpression, reactionFunction) {
    // if `skipNextPerfWatchers` is true, this means the previous run of the
    // `$watch` decorator was a one time binding expression and this invocation
    // of the $watch function has the `oneTimeInterceptedExpression` (internal angular function)
    // as the `watchExpression` parameter. If we decorate it with the performance
    // timers function this will cause us to invoke `oneTimeInterceptedExpression`
    // on subsequent digest loops and will update the one time bindings
    // if anything mutated the property.
    if (skipNextPerfWatchers) {
      skipNextPerfWatchers = false;
      return _watch.apply(this, arguments);
    }

    if (typeof watchExpression === 'string' &&
        isOneTimeBindExp(watchExpression)) {
      skipNextPerfWatchers = true;
      return _watch.apply(this, arguments);
    }
    var watchStr = humanReadableWatchExpression(watchExpression);
    var scopeId = this.$id;
    var expressions = null;
    if (typeof watchExpression === 'function') {
      expressions = watchExpression.expressions;
      if (Object.prototype.toString.call(expressions) === '[object Array]' &&
          expressions.some(isOneTimeBindExp)) {
        skipNextPerfWatchers = true;
        return _watch.apply(this, arguments);
      }

      arguments[0] = function () {
        var start = perf.now();
        var ret = watchExpression.apply(this, arguments);
        var end = perf.now();
        _digestEvents.push({
          eventType: 'scope:watch',
          id: scopeId,
          watch: watchStr,
          time: end - start
        });
        return ret;
      };
    } else {
      var thatScope = this;
      arguments[0] = function () {
        var start = perf.now();
        var ret = thatScope.$eval(watchExpression);
        var end = perf.now();
        _digestEvents.push({
          eventType: 'scope:watch',
          id: scopeId,
          watch: watchStr,
          time: end - start
        });
        return ret;
      };
    }

    if (typeof reactionFunction === 'function') {
      arguments[1] = function () {
        var start = perf.now();
        var ret = reactionFunction.apply(this, arguments);
        var end = perf.now();
        _digestEvents.push({
          eventType: 'scope:reaction',
          id: scopeId,
          watch: watchStr,
          time: end - start
        });
        return ret;
      };
    }

    return _watch.apply(this, arguments);
  };

  var _digest = scopePrototype.$digest;
  scopePrototype.$digest = function (fn) {
    _digestEvents = [];
    var start = perf.now();
    var ret = _digest.apply(this, arguments);
    var end = perf.now();
    hint.emit('scope:digest', {
      id: this.$id,
      time: end - start,
      events: _digestEvents
    });
    return ret;
  };

  var _destroy = scopePrototype.$destroy;
  scopePrototype.$destroy = function () {
    var id = this.$id;

    hint.emit('scope:destroy', { id: id });

    delete scopes[id];
    delete watching[id];

    return _destroy.apply(this, arguments);
  };


  var _new = scopePrototype.$new;
  scopePrototype.$new = function () {
    var child = _new.apply(this, arguments);

    scopes[child.$id] = child;
    watching[child.$id] = {};

    hint.emit('scope:new', { parent: this.$id, child: child.$id });
    setTimeout(function () {
      emitScopeElt(child);
    }, 0);
    return child;
  };

  function emitScopeElt (scope) {
    var scopeId = scope.$id;
    var elt = findElt(scopeId);
    var descriptor = scopeDescriptor(elt, scope);
    hint.emit('scope:link', {
      id: scopeId,
      descriptor: descriptor
    });
  }

  function findElt (scopeId) {
    var elts = document.querySelectorAll('.ng-scope');
    var elt, scope;

    for (var i = 0; i < elts.length; i++) {
      elt = angular.element(elts[i]);
      scope = elt.scope();
      if (scope.$id === scopeId) {
        return elt;
      }
    }
  }

  var _apply = scopePrototype.$apply;
  scopePrototype.$apply = function (fn) {
    // var start = perf.now();
    var ret = _apply.apply(this, arguments);
    // var end = perf.now();
    // hint.emit('scope:apply', { id: this.$id, time: end - start });
    debouncedEmitModelChange();
    return ret;
  };


  function gettterer (scopeId, path) {
    if (path === '') {
      return function () {
        return scopes[scopeId];
      };
    }
    var getter = $parse(path);
    return function () {
      return getter(scopes[scopeId]);
    };
  }

  function emitModelChange () {
    Object.keys(watching).forEach(function (scopeId) {
      Object.keys(watching[scopeId]).forEach(function (path) {
        var model = watching[scopeId][path];
        var value = summarize(model.get());
        if (value !== model.value) {
          hint.emit('model:change', {
            id: convertIdToOriginalType(scopeId),
            path: path,
            oldValue: model.value,
            value: value
          });
          model.value = value;
        }
      });
    });
  }

  hint.emit('scope:new', {
    parent: null,
    child: $delegate.$id
  });
  scopes[$delegate.$id] = $delegate;
  watching[$delegate.$id] = {};

  return $delegate;
}

function decorateDollaCompile ($delegate) {
  var newCompile = function () {
    var link = $delegate.apply(this, arguments);

    return function (scope) {
      var elt = link.apply(this, arguments);
      var descriptor = scopeDescriptor(elt, scope);
      hint.emit('scope:link', {
        id: scope.$id,
        descriptor: descriptor
      });
      return elt;
    };
  };

  // TODO: test this
  // copy private helpers like $$addScopeInfo
  for (var prop in $delegate) {
    if ($delegate.hasOwnProperty(prop)) {
      newCompile[prop] = $delegate[prop];
    }
  }
  return newCompile;
}

var TYPES = [
  'ng-app',
  'ng-controller',
  'ng-repeat',
  'ng-include'
];

function scopeDescriptor (elt, scope) {
  var val,
      theseTypes = [],
      type;

  if (elt) {
    for (var i = 0, ii = TYPES.length; i < ii; i++) {
      type = TYPES[i];
      if (val = elt.attr(type)) {
        theseTypes.push(type + '="' + val + '"');
      }
    }
  }
  if (theseTypes.length === 0) {
    return 'scope.$id=' + scope.$id;
  } else {
    return theseTypes.join(' ');
  }
}

function humanReadableWatchExpression (fn) {
  if (fn == null) {
    return null;
  }
  if (fn.exp) {
    fn = fn.exp;
  } else if (fn.name) {
    fn = fn.name;
  }
  return fn.toString();
}

function isOneTimeBindExp(exp) {
  // this is the same code angular 1.3.15 has to check
  // for a one time bind expression
  return exp.charAt(0) === ':' && exp.charAt(1) === ':';
}

function convertIdToOriginalType(scopeId) {
  return (angular.version.minor < 3) ? scopeId : parseInt(scopeId, 10);
}
