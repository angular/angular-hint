
'use strict';

////////////////////////////////////

/**
 * @ngdoc module
 * @name ng
 * @module ng
 * @description
 *
 * # ng (core module)
 * The ng module is loaded by default when an AngularJS application is started. The module itself
 * contains the essential components for an AngularJS application to function. The table below
 * lists a high level breakdown of each of the services/factories, filters, directives and testing
 * components available within this core module.
 *
 * <div doc-module-components="ng"></div>
 */

var REGEX_STRING_REGEXP = /^\/(.+)\/([a-z]*)$/;

// The name of a form control's ValidityState property.
// This is used so that it's possible for internal tests to create mock ValidityStates.
var VALIDITY_STATE_PROPERTY = 'validity';

/**
 * @ngdoc function
 * @name angular.lowercase
 * @module ng
 * @kind function
 *
 * @description Converts the specified string to lowercase.
 * @param {string} string String to be converted to lowercase.
 * @returns {string} Lowercased string.
 */
var lowercase = function(string) {return isString(string) ? string.toLowerCase() : string;};
var hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * @ngdoc function
 * @name angular.uppercase
 * @module ng
 * @kind function
 *
 * @description Converts the specified string to uppercase.
 * @param {string} string String to be converted to uppercase.
 * @returns {string} Uppercased string.
 */
var uppercase = function(string) {return isString(string) ? string.toUpperCase() : string;};


var manualLowercase = function(s) {
  /* jshint bitwise: false */
  return isString(s)
      ? s.replace(/[A-Z]/g, function(ch) {return String.fromCharCode(ch.charCodeAt(0) | 32);})
      : s;
};
var manualUppercase = function(s) {
  /* jshint bitwise: false */
  return isString(s)
      ? s.replace(/[a-z]/g, function(ch) {return String.fromCharCode(ch.charCodeAt(0) & ~32);})
      : s;
};


// String#toLowerCase and String#toUpperCase don't produce correct results in browsers with Turkish
// locale, for this reason we need to detect this case and redefine lowercase/uppercase methods
// with correct but slower alternatives.
if ('i' !== 'I'.toLowerCase()) {
  lowercase = manualLowercase;
  uppercase = manualUppercase;
}


var slice             = [].slice,
    splice            = [].splice,
    push              = [].push,
    toString          = Object.prototype.toString,

    /** @name angular */
    angularModule,
    uid               = 0;



/**
 * @private
 * @param {*} obj
 * @return {boolean} Returns true if `obj` is an array or array-like object (NodeList, Arguments,
 *                   String ...)
 */
function isArrayLike(obj) {
  if (obj == null || isWindow(obj)) {
    return false;
  }

  var length = obj.length;

  if (obj.nodeType === NODE_TYPE_ELEMENT && length) {
    return true;
  }

  return isString(obj) || isArray(obj) || length === 0 ||
         typeof length === 'number' && length > 0 && (length - 1) in obj;
}

/**
 * @ngdoc function
 * @name angular.forEach
 * @module ng
 * @kind function
 *
 * @description
 * Invokes the `iterator` function once for each item in `obj` collection, which can be either an
 * object or an array. The `iterator` function is invoked with `iterator(value, key, obj)`, where `value`
 * is the value of an object property or an array element, `key` is the object property key or
 * array element index and obj is the `obj` itself. Specifying a `context` for the function is optional.
 *
 * It is worth noting that `.forEach` does not iterate over inherited properties because it filters
 * using the `hasOwnProperty` method.
 *
 * Unlike ES262's
 * [Array.prototype.forEach](http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.18),
 * Providing 'undefined' or 'null' values for `obj` will not throw a TypeError, but rather just
 * return the value provided.
 *
   ```js
     var values = {name: 'misko', gender: 'male'};
     var log = [];
     angular.forEach(values, function(value, key) {
       this.push(key + ': ' + value);
     }, log);
     expect(log).toEqual(['name: misko', 'gender: male']);
   ```
 *
 * @param {Object|Array} obj Object to iterate over.
 * @param {Function} iterator Iterator function.
 * @param {Object=} context Object to become context (`this`) for the iterator function.
 * @returns {Object|Array} Reference to `obj`.
 */

function forEach(obj, iterator, context) {
  var key, length;
  if (obj) {
    if (isFunction(obj)) {
      for (key in obj) {
        // Need to check if hasOwnProperty exists,
        // as on IE8 the result of querySelectorAll is an object without a hasOwnProperty function
        if (key != 'prototype' && key != 'length' && key != 'name' && (!obj.hasOwnProperty || obj.hasOwnProperty(key))) {
          iterator.call(context, obj[key], key, obj);
        }
      }
    } else if (isArray(obj) || isArrayLike(obj)) {
      var isPrimitive = typeof obj !== 'object';
      for (key = 0, length = obj.length; key < length; key++) {
        if (isPrimitive || key in obj) {
          iterator.call(context, obj[key], key, obj);
        }
      }
    } else if (obj.forEach && obj.forEach !== forEach) {
        obj.forEach(iterator, context, obj);
    } else {
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          iterator.call(context, obj[key], key, obj);
        }
      }
    }
  }
  return obj;
}

function sortedKeys(obj) {
  return Object.keys(obj).sort();
}

function forEachSorted(obj, iterator, context) {
  var keys = sortedKeys(obj);
  for (var i = 0; i < keys.length; i++) {
    iterator.call(context, obj[keys[i]], keys[i]);
  }
  return keys;
}


/**
 * when using forEach the params are value, key, but it is often useful to have key, value.
 * @param {function(string, *)} iteratorFn
 * @returns {function(*, string)}
 */
function reverseParams(iteratorFn) {
  return function(value, key) { iteratorFn(key, value); };
}

/**
 * A consistent way of creating unique IDs in angular.
 *
 * Using simple numbers allows us to generate 28.6 million unique ids per second for 10 years before
 * we hit number precision issues in JavaScript.
 *
 * Math.pow(2,53) / 60 / 60 / 24 / 365 / 10 = 28.6M
 *
 * @returns {number} an unique alpha-numeric string
 */
function nextUid() {
  return ++uid;
}


/**
 * Set or clear the hashkey for an object.
 * @param obj object
 * @param h the hashkey (!truthy to delete the hashkey)
 */
function setHashKey(obj, h) {
  if (h) {
    obj.$$hashKey = h;
  }
  else {
    delete obj.$$hashKey;
  }
}

/**
 * @ngdoc function
 * @name angular.extend
 * @module ng
 * @kind function
 *
 * @description
 * Extends the destination object `dst` by copying own enumerable properties from the `src` object(s)
 * to `dst`. You can specify multiple `src` objects. If you want to preserve original objects, you can do so
 * by passing an empty object as the target: `var object = angular.extend({}, object1, object2)`.
 * Note: Keep in mind that `angular.extend` does not support recursive merge (deep copy).
 *
 * @param {Object} dst Destination object.
 * @param {...Object} src Source object(s).
 * @returns {Object} Reference to `dst`.
 */
function extend(dst) {
  var h = dst.$$hashKey;

  for (var i = 1, ii = arguments.length; i < ii; i++) {
    var obj = arguments[i];
    if (obj) {
      var keys = Object.keys(obj);
      for (var j = 0, jj = keys.length; j < jj; j++) {
        var key = keys[j];
        dst[key] = obj[key];
      }
    }
  }

  setHashKey(dst, h);
  return dst;
}

function int(str) {
  return parseInt(str, 10);
}


function inherit(parent, extra) {
  return extend(Object.create(parent), extra);
}

/**
 * @ngdoc function
 * @name angular.noop
 * @module ng
 * @kind function
 *
 * @description
 * A function that performs no operations. This function can be useful when writing code in the
 * functional style.
   ```js
     function foo(callback) {
       var result = calculateResult();
       (callback || angular.noop)(result);
     }
   ```
 */
function noop() {}
noop.$inject = [];


/**
 * @ngdoc function
 * @name angular.identity
 * @module ng
 * @kind function
 *
 * @description
 * A function that returns its first argument. This function is useful when writing code in the
 * functional style.
 *
   ```js
     function transformer(transformationFn, value) {
       return (transformationFn || angular.identity)(value);
     };
   ```
 */
function identity($) {return $;}
identity.$inject = [];


function valueFn(value) {return function() {return value;};}

/**
 * @ngdoc function
 * @name angular.isUndefined
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is undefined.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is undefined.
 */
function isUndefined(value) {return typeof value === 'undefined';}


/**
 * @ngdoc function
 * @name angular.isDefined
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is defined.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is defined.
 */
function isDefined(value) {return typeof value !== 'undefined';}


/**
 * @ngdoc function
 * @name angular.isObject
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is an `Object`. Unlike `typeof` in JavaScript, `null`s are not
 * considered to be objects. Note that JavaScript arrays are objects.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is an `Object` but not `null`.
 */
function isObject(value) {
  // http://jsperf.com/isobject4
  return value !== null && typeof value === 'object';
}


/**
 * @ngdoc function
 * @name angular.isString
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is a `String`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `String`.
 */
function isString(value) {return typeof value === 'string';}


/**
 * @ngdoc function
 * @name angular.isNumber
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is a `Number`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `Number`.
 */
function isNumber(value) {return typeof value === 'number';}


/**
 * @ngdoc function
 * @name angular.isDate
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a value is a date.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `Date`.
 */
function isDate(value) {
  return toString.call(value) === '[object Date]';
}


/**
 * @ngdoc function
 * @name angular.isArray
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is an `Array`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is an `Array`.
 */
var isArray = Array.isArray;

/**
 * @ngdoc function
 * @name angular.isFunction
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is a `Function`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `Function`.
 */
function isFunction(value) {return typeof value === 'function';}


/**
 * Determines if a value is a regular expression object.
 *
 * @private
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `RegExp`.
 */
function isRegExp(value) {
  return toString.call(value) === '[object RegExp]';
}


/**
 * Checks if `obj` is a window object.
 *
 * @private
 * @param {*} obj Object to check
 * @returns {boolean} True if `obj` is a window obj.
 */
function isWindow(obj) {
  return obj && obj.window === obj;
}


function isScope(obj) {
  return obj && obj.$evalAsync && obj.$watch;
}


function isFile(obj) {
  return toString.call(obj) === '[object File]';
}


function isBlob(obj) {
  return toString.call(obj) === '[object Blob]';
}


function isBoolean(value) {
  return typeof value === 'boolean';
}


function isPromiseLike(obj) {
  return obj && isFunction(obj.then);
}


var trim = function(value) {
  return isString(value) ? value.trim() : value;
};

// Copied from:
// http://docs.closure-library.googlecode.com/git/local_closure_goog_string_string.js.source.html#line1021
// Prereq: s is a string.
var escapeForRegexp = function(s) {
  return s.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').
           replace(/\x08/g, '\\x08');
};


/**
 * @ngdoc function
 * @name angular.isElement
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is a DOM element (or wrapped jQuery element).
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a DOM element (or wrapped jQuery element).
 */
function isElement(node) {
  return !!(node &&
    (node.nodeName  // we are a direct element
    || (node.prop && node.attr && node.find)));  // we have an on and find method part of jQuery API
}

/**
 * @param str 'key1,key2,...'
 * @returns {object} in the form of {key1:true, key2:true, ...}
 */
function makeMap(str) {
  var obj = {}, items = str.split(","), i;
  for (i = 0; i < items.length; i++)
    obj[ items[i] ] = true;
  return obj;
}


function nodeName_(element) {
  return lowercase(element.nodeName || (element[0] && element[0].nodeName));
}

function includes(array, obj) {
  return Array.prototype.indexOf.call(array, obj) != -1;
}

function arrayRemove(array, value) {
  var index = array.indexOf(value);
  if (index >= 0)
    array.splice(index, 1);
  return value;
}

/**
 * @ngdoc function
 * @name angular.copy
 * @module ng
 * @kind function
 *
 * @description
 * Creates a deep copy of `source`, which should be an object or an array.
 *
 * * If no destination is supplied, a copy of the object or array is created.
 * * If a destination is provided, all of its elements (for array) or properties (for objects)
 *   are deleted and then all elements/properties from the source are copied to it.
 * * If `source` is not an object or array (inc. `null` and `undefined`), `source` is returned.
 * * If `source` is identical to 'destination' an exception will be thrown.
 *
 * @param {*} source The source that will be used to make a copy.
 *                   Can be any type, including primitives, `null`, and `undefined`.
 * @param {(Object|Array)=} destination Destination into which the source is copied. If
 *     provided, must be of the same type as `source`.
 * @returns {*} The copy or updated `destination`, if `destination` was specified.
 *
 * @example
 <example module="copyExample">
 <file name="index.html">
 <div ng-controller="ExampleController">
 <form novalidate class="simple-form">
 Name: <input type="text" ng-model="user.name" /><br />
 E-mail: <input type="email" ng-model="user.email" /><br />
 Gender: <input type="radio" ng-model="user.gender" value="male" />male
 <input type="radio" ng-model="user.gender" value="female" />female<br />
 <button ng-click="reset()">RESET</button>
 <button ng-click="update(user)">SAVE</button>
 </form>
 <pre>form = {{user | json}}</pre>
 <pre>master = {{master | json}}</pre>
 </div>

 <script>
  angular.module('copyExample', [])
    .controller('ExampleController', ['$scope', function($scope) {
      $scope.master= {};

      $scope.update = function(user) {
        // Example with 1 argument
        $scope.master= angular.copy(user);
      };

      $scope.reset = function() {
        // Example with 2 arguments
        angular.copy($scope.master, $scope.user);
      };

      $scope.reset();
    }]);
 </script>
 </file>
 </example>
 */
function copy(source, destination, stackSource, stackDest) {
  if (isWindow(source) || isScope(source)) {
    throw ngMinErr('cpws',
      "Can't copy! Making copies of Window or Scope instances is not supported.");
  }

  if (!destination) {
    destination = source;
    if (source) {
      if (isArray(source)) {
        destination = copy(source, [], stackSource, stackDest);
      } else if (isDate(source)) {
        destination = new Date(source.getTime());
      } else if (isRegExp(source)) {
        destination = new RegExp(source.source, source.toString().match(/[^\/]*$/)[0]);
        destination.lastIndex = source.lastIndex;
      } else if (isObject(source)) {
        var emptyObject = Object.create(Object.getPrototypeOf(source));
        destination = copy(source, emptyObject, stackSource, stackDest);
      }
    }
  } else {
    if (source === destination) throw ngMinErr('cpi',
      "Can't copy! Source and destination are identical.");

    stackSource = stackSource || [];
    stackDest = stackDest || [];

    if (isObject(source)) {
      var index = stackSource.indexOf(source);
      if (index !== -1) return stackDest[index];

      stackSource.push(source);
      stackDest.push(destination);
    }

    var result;
    if (isArray(source)) {
      destination.length = 0;
      for (var i = 0; i < source.length; i++) {
        result = copy(source[i], null, stackSource, stackDest);
        if (isObject(source[i])) {
          stackSource.push(source[i]);
          stackDest.push(result);
        }
        destination.push(result);
      }
    } else {
      var h = destination.$$hashKey;
      if (isArray(destination)) {
        destination.length = 0;
      } else {
        forEach(destination, function(value, key) {
          delete destination[key];
        });
      }
      for (var key in source) {
        if (source.hasOwnProperty(key)) {
          result = copy(source[key], null, stackSource, stackDest);
          if (isObject(source[key])) {
            stackSource.push(source[key]);
            stackDest.push(result);
          }
          destination[key] = result;
        }
      }
      setHashKey(destination,h);
    }

  }
  return destination;
}

/**
 * Creates a shallow copy of an object, an array or a primitive.
 *
 * Assumes that there are no proto properties for objects.
 */
function shallowCopy(src, dst) {
  if (isArray(src)) {
    dst = dst || [];

    for (var i = 0, ii = src.length; i < ii; i++) {
      dst[i] = src[i];
    }
  } else if (isObject(src)) {
    dst = dst || {};

    for (var key in src) {
      if (!(key.charAt(0) === '$' && key.charAt(1) === '$')) {
        dst[key] = src[key];
      }
    }
  }

  return dst || src;
}


/**
 * @ngdoc function
 * @name angular.equals
 * @module ng
 * @kind function
 *
 * @description
 * Determines if two objects or two values are equivalent. Supports value types, regular
 * expressions, arrays and objects.
 *
 * Two objects or values are considered equivalent if at least one of the following is true:
 *
 * * Both objects or values pass `===` comparison.
 * * Both objects or values are of the same type and all of their properties are equal by
 *   comparing them with `angular.equals`.
 * * Both values are NaN. (In JavaScript, NaN == NaN => false. But we consider two NaN as equal)
 * * Both values represent the same regular expression (In JavaScript,
 *   /abc/ == /abc/ => false. But we consider two regular expressions as equal when their textual
 *   representation matches).
 *
 * During a property comparison, properties of `function` type and properties with names
 * that begin with `$` are ignored.
 *
 * Scope and DOMWindow objects are being compared only by identify (`===`).
 *
 * @param {*} o1 Object or value to compare.
 * @param {*} o2 Object or value to compare.
 * @returns {boolean} True if arguments are equal.
 */
function equals(o1, o2) {
  if (o1 === o2) return true;
  if (o1 === null || o2 === null) return false;
  if (o1 !== o1 && o2 !== o2) return true; // NaN === NaN
  var t1 = typeof o1, t2 = typeof o2, length, key, keySet;
  if (t1 == t2) {
    if (t1 == 'object') {
      if (isArray(o1)) {
        if (!isArray(o2)) return false;
        if ((length = o1.length) == o2.length) {
          for (key = 0; key < length; key++) {
            if (!equals(o1[key], o2[key])) return false;
          }
          return true;
        }
      } else if (isDate(o1)) {
        if (!isDate(o2)) return false;
        return equals(o1.getTime(), o2.getTime());
      } else if (isRegExp(o1) && isRegExp(o2)) {
        return o1.toString() == o2.toString();
      } else {
        if (isScope(o1) || isScope(o2) || isWindow(o1) || isWindow(o2) || isArray(o2)) return false;
        keySet = {};
        for (key in o1) {
          if (key.charAt(0) === '$' || isFunction(o1[key])) continue;
          if (!equals(o1[key], o2[key])) return false;
          keySet[key] = true;
        }
        for (key in o2) {
          if (!keySet.hasOwnProperty(key) &&
              key.charAt(0) !== '$' &&
              o2[key] !== undefined &&
              !isFunction(o2[key])) return false;
        }
        return true;
      }
    }
  }
  return false;
}

var csp = function() {
  if (isDefined(csp.isActive_)) return csp.isActive_;

  var active = !!(document.querySelector('[ng-csp]') ||
                  document.querySelector('[data-ng-csp]'));

  if (!active) {
    try {
      /* jshint -W031, -W054 */
      new Function('');
      /* jshint +W031, +W054 */
    } catch (e) {
      active = true;
    }
  }

  return (csp.isActive_ = active);
};



function concat(array1, array2, index) {
  return array1.concat(slice.call(array2, index));
}

function sliceArgs(args, startIndex) {
  return slice.call(args, startIndex || 0);
}


/* jshint -W101 */
/**
 * @ngdoc function
 * @name angular.bind
 * @module ng
 * @kind function
 *
 * @description
 * Returns a function which calls function `fn` bound to `self` (`self` becomes the `this` for
 * `fn`). You can supply optional `args` that are prebound to the function. This feature is also
 * known as [partial application](http://en.wikipedia.org/wiki/Partial_application), as
 * distinguished from [function currying](http://en.wikipedia.org/wiki/Currying#Contrast_with_partial_function_application).
 *
 * @param {Object} self Context which `fn` should be evaluated in.
 * @param {function()} fn Function to be bound.
 * @param {...*} args Optional arguments to be prebound to the `fn` function call.
 * @returns {function()} Function that wraps the `fn` with all the specified bindings.
 */
/* jshint +W101 */
function bind(self, fn) {
  var curryArgs = arguments.length > 2 ? sliceArgs(arguments, 2) : [];
  if (isFunction(fn) && !(fn instanceof RegExp)) {
    return curryArgs.length
      ? function() {
          return arguments.length
            ? fn.apply(self, concat(curryArgs, arguments, 0))
            : fn.apply(self, curryArgs);
        }
      : function() {
          return arguments.length
            ? fn.apply(self, arguments)
            : fn.call(self);
        };
  } else {
    // in IE, native methods are not functions so they cannot be bound (note: they don't need to be)
    return fn;
  }
}


function toJsonReplacer(key, value) {
  var val = value;

  if (typeof key === 'string' && key.charAt(0) === '$' && key.charAt(1) === '$') {
    val = undefined;
  } else if (isWindow(value)) {
    val = '$WINDOW';
  } else if (value &&  document === value) {
    val = '$DOCUMENT';
  } else if (isScope(value)) {
    val = '$SCOPE';
  }

  return val;
}


/**
 * @ngdoc function
 * @name angular.toJson
 * @module ng
 * @kind function
 *
 * @description
 * Serializes input into a JSON-formatted string. Properties with leading $$ characters will be
 * stripped since angular uses this notation internally.
 *
 * @param {Object|Array|Date|string|number} obj Input to be serialized into JSON.
 * @param {boolean|number=} pretty If set to true, the JSON output will contain newlines and whitespace.
 *    If set to an integer, the JSON output will contain that many spaces per indentation (the default is 2).
 * @returns {string|undefined} JSON-ified string representing `obj`.
 */
function toJson(obj, pretty) {
  if (typeof obj === 'undefined') return undefined;
  if (!isNumber(pretty)) {
    pretty = pretty ? 2 : null;
  }
  return JSON.stringify(obj, toJsonReplacer, pretty);
}


/**
 * @ngdoc function
 * @name angular.fromJson
 * @module ng
 * @kind function
 *
 * @description
 * Deserializes a JSON string.
 *
 * @param {string} json JSON string to deserialize.
 * @returns {Object|Array|string|number} Deserialized thingy.
 */
function fromJson(json) {
  return isString(json)
      ? JSON.parse(json)
      : json;
}


/**
 * @returns {string} Returns the string representation of the element.
 */
function startingTag(element) {
  element = jqLite(element).clone();
  try {
    // turns out IE does not let you set .html() on elements which
    // are not allowed to have children. So we just ignore it.
    element.empty();
  } catch (e) {}
  var elemHtml = jqLite('<div>').append(element).html();
  try {
    return element[0].nodeType === NODE_TYPE_TEXT ? lowercase(elemHtml) :
        elemHtml.
          match(/^(<[^>]+>)/)[1].
          replace(/^<([\w\-]+)/, function(match, nodeName) { return '<' + lowercase(nodeName); });
  } catch (e) {
    return lowercase(elemHtml);
  }

}


/////////////////////////////////////////////////

/**
 * Tries to decode the URI component without throwing an exception.
 *
 * @private
 * @param str value potential URI component to check.
 * @returns {boolean} True if `value` can be decoded
 * with the decodeURIComponent function.
 */
function tryDecodeURIComponent(value) {
  try {
    return decodeURIComponent(value);
  } catch (e) {
    // Ignore any invalid uri component
  }
}


/**
 * Parses an escaped url query string into key-value pairs.
 * @returns {Object.<string,boolean|Array>}
 */
function parseKeyValue(/**string*/keyValue) {
  var obj = {}, key_value, key;
  forEach((keyValue || "").split('&'), function(keyValue) {
    if (keyValue) {
      key_value = keyValue.replace(/\+/g,'%20').split('=');
      key = tryDecodeURIComponent(key_value[0]);
      if (isDefined(key)) {
        var val = isDefined(key_value[1]) ? tryDecodeURIComponent(key_value[1]) : true;
        if (!hasOwnProperty.call(obj, key)) {
          obj[key] = val;
        } else if (isArray(obj[key])) {
          obj[key].push(val);
        } else {
          obj[key] = [obj[key],val];
        }
      }
    }
  });
  return obj;
}

function toKeyValue(obj) {
  var parts = [];
  forEach(obj, function(value, key) {
    if (isArray(value)) {
      forEach(value, function(arrayValue) {
        parts.push(encodeUriQuery(key, true) +
                   (arrayValue === true ? '' : '=' + encodeUriQuery(arrayValue, true)));
      });
    } else {
    parts.push(encodeUriQuery(key, true) +
               (value === true ? '' : '=' + encodeUriQuery(value, true)));
    }
  });
  return parts.length ? parts.join('&') : '';
}


/**
 * We need our custom method because encodeURIComponent is too aggressive and doesn't follow
 * http://www.ietf.org/rfc/rfc3986.txt with regards to the character set (pchar) allowed in path
 * segments:
 *    segment       = *pchar
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 */
function encodeUriSegment(val) {
  return encodeUriQuery(val, true).
             replace(/%26/gi, '&').
             replace(/%3D/gi, '=').
             replace(/%2B/gi, '+');
}


/**
 * This method is intended for encoding *key* or *value* parts of query component. We need a custom
 * method because encodeURIComponent is too aggressive and encodes stuff that doesn't have to be
 * encoded per http://tools.ietf.org/html/rfc3986:
 *    query       = *( pchar / "/" / "?" )
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 */
function encodeUriQuery(val, pctEncodeSpaces) {
  return encodeURIComponent(val).
             replace(/%40/gi, '@').
             replace(/%3A/gi, ':').
             replace(/%24/g, '$').
             replace(/%2C/gi, ',').
             replace(/%3B/gi, ';').
             replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
}

var ngAttrPrefixes = ['ng-', 'data-ng-', 'ng:', 'x-ng-'];

function getNgAttribute(element, ngAttr) {
  var attr, i, ii = ngAttrPrefixes.length;
  element = jqLite(element);
  for (i = 0; i < ii; ++i) {
    attr = ngAttrPrefixes[i] + ngAttr;
    if (isString(attr = element.attr(attr))) {
      return attr;
    }
  }
  return null;
}


/**
 * @ngdoc function
 * @name angular.reloadWithDebugInfo
 * @module ng
 * @description
 * Use this function to reload the current application with debug information turned on.
 * This takes precedence over a call to `$compileProvider.debugInfoEnabled(false)`.
 *
 * See {@link ng.$compileProvider#debugInfoEnabled} for more.
 */
function reloadWithDebugInfo() {
  window.name = 'NG_ENABLE_DEBUG_INFO!' + window.name;
  window.location.reload();
}

/**
 * @name angular.getTestability
 * @module ng
 * @description
 * Get the testability service for the instance of Angular on the given
 * element.
 * @param {DOMElement} element DOM element which is the root of angular application.
 */
function getTestability(rootElement) {
  return angular.element(rootElement).injector().get('$$testability');
}

var SNAKE_CASE_REGEXP = /[A-Z]/g;
function snake_case(name, separator) {
  separator = separator || '_';
  return name.replace(SNAKE_CASE_REGEXP, function(letter, pos) {
    return (pos ? separator : '') + letter.toLowerCase();
  });
}

var bindJQueryFired = false;
var skipDestroyOnNextJQueryCleanData;
function bindJQuery() {
  var originalCleanData;

  if (bindJQueryFired) {
    return;
  }

  // bind to jQuery if present;
  jQuery = window.jQuery;
  // Use jQuery if it exists with proper functionality, otherwise default to us.
  // Angular 1.2+ requires jQuery 1.7+ for on()/off() support.
  // Angular 1.3+ technically requires at least jQuery 2.1+ but it may work with older
  // versions. It will not work for sure with jQuery <1.7, though.
  if (jQuery && jQuery.fn.on) {
    jqLite = jQuery;
    extend(jQuery.fn, {
      scope: JQLitePrototype.scope,
      isolateScope: JQLitePrototype.isolateScope,
      controller: JQLitePrototype.controller,
      injector: JQLitePrototype.injector,
      inheritedData: JQLitePrototype.inheritedData
    });

    // All nodes removed from the DOM via various jQuery APIs like .remove()
    // are passed through jQuery.cleanData. Monkey-patch this method to fire
    // the $destroy event on all removed nodes.
    originalCleanData = jQuery.cleanData;
    jQuery.cleanData = function(elems) {
      var events;
      if (!skipDestroyOnNextJQueryCleanData) {
        for (var i = 0, elem; (elem = elems[i]) != null; i++) {
          events = jQuery._data(elem, "events");
          if (events && events.$destroy) {
            jQuery(elem).triggerHandler('$destroy');
          }
        }
      } else {
        skipDestroyOnNextJQueryCleanData = false;
      }
      originalCleanData(elems);
    };
  } else {
    jqLite = JQLite;
  }

  angular.element = jqLite;

  // Prevent double-proxying.
  bindJQueryFired = true;
}

/**
 * throw error if the argument is falsy.
 */
function assertArg(arg, name, reason) {
  if (!arg) {
    throw ngMinErr('areq', "Argument '{0}' is {1}", (name || '?'), (reason || "required"));
  }
  return arg;
}

function assertArgFn(arg, name, acceptArrayAnnotation) {
  if (acceptArrayAnnotation && isArray(arg)) {
      arg = arg[arg.length - 1];
  }

  assertArg(isFunction(arg), name, 'not a function, got ' +
      (arg && typeof arg === 'object' ? arg.constructor.name || 'Object' : typeof arg));
  return arg;
}

/**
 * throw error if the name given is hasOwnProperty
 * @param  {String} name    the name to test
 * @param  {String} context the context in which the name is used, such as module or directive
 */
function assertNotHasOwnProperty(name, context) {
  if (name === 'hasOwnProperty') {
    throw ngMinErr('badname', "hasOwnProperty is not a valid {0} name", context);
  }
}

/**
 * Return the value accessible from the object by path. Any undefined traversals are ignored
 * @param {Object} obj starting object
 * @param {String} path path to traverse
 * @param {boolean} [bindFnToScope=true]
 * @returns {Object} value as accessible by path
 */
//TODO(misko): this function needs to be removed
function getter(obj, path, bindFnToScope) {
  if (!path) return obj;
  var keys = path.split('.');
  var key;
  var lastInstance = obj;
  var len = keys.length;

  for (var i = 0; i < len; i++) {
    key = keys[i];
    if (obj) {
      obj = (lastInstance = obj)[key];
    }
  }
  if (!bindFnToScope && isFunction(obj)) {
    return bind(lastInstance, obj);
  }
  return obj;
}

/**
 * Return the DOM siblings between the first and last node in the given array.
 * @param {Array} array like object
 * @returns {jqLite} jqLite collection containing the nodes
 */
function getBlockNodes(nodes) {
  // TODO(perf): just check if all items in `nodes` are siblings and if they are return the original
  //             collection, otherwise update the original collection.
  var node = nodes[0];
  var endNode = nodes[nodes.length - 1];
  var blockNodes = [node];

  do {
    node = node.nextSibling;
    if (!node) break;
    blockNodes.push(node);
  } while (node !== endNode);

  return jqLite(blockNodes);
}


/**
 * Creates a new object without a prototype. This object is useful for lookup without having to
 * guard against prototypically inherited properties via hasOwnProperty.
 *
 * Related micro-benchmarks:
 * - http://jsperf.com/object-create2
 * - http://jsperf.com/proto-map-lookup/2
 * - http://jsperf.com/for-in-vs-object-keys2
 *
 * @returns {Object}
 */
function createMap() {
  return Object.create(null);
}

var NODE_TYPE_ELEMENT = 1;
var NODE_TYPE_TEXT = 3;
var NODE_TYPE_COMMENT = 8;
var NODE_TYPE_DOCUMENT = 9;
var NODE_TYPE_DOCUMENT_FRAGMENT = 11;


/*
 * same as $parse, but less forgiving
 */

'use strict';

function minErr() {}

var $parseMinErr = minErr('$parse');

// Sandboxing Angular Expressions
// ------------------------------
// Angular expressions are generally considered safe because these expressions only have direct
// access to `$scope` and locals. However, one can obtain the ability to execute arbitrary JS code by
// obtaining a reference to native JS functions such as the Function constructor.
//
// As an example, consider the following Angular expression:
//
//   {}.toString.constructor('alert("evil JS code")')
//
// This sandboxing technique is not perfect and doesn't aim to be. The goal is to prevent exploits
// against the expression language, but not to prevent exploits that were enabled by exposing
// sensitive JavaScript or browser APIs on Scope. Exposing such objects on a Scope is never a good
// practice and therefore we are not even trying to protect against interaction with an object
// explicitly exposed in this way.
//
// In general, it is not possible to access a Window object from an angular expression unless a
// window or some DOM object that has a reference to window is published onto a Scope.
// Similarly we prevent invocations of function known to be dangerous, as well as assignments to
// native objects.
//
// See https://docs.angularjs.org/guide/security


function ensureSafeMemberName(name, fullExpression) {
  if (name === "__defineGetter__" || name === "__defineSetter__"
      || name === "__lookupGetter__" || name === "__lookupSetter__"
      || name === "__proto__") {
    throw $parseMinErr('isecfld',
        'Attempting to access a disallowed field in Angular expressions! '
        + 'Expression: {0}', fullExpression);
  }
  return name;
}

function ensureSafeObject(obj, fullExpression) {
  // nifty check if obj is Function that is fast and works across iframes and other contexts
  if (obj) {
    if (obj.constructor === obj) {
      throw $parseMinErr('isecfn',
          'Referencing Function in Angular expressions is disallowed! Expression: {0}',
          fullExpression);
    } else if (// isWindow(obj)
        obj.window === obj) {
      throw $parseMinErr('isecwindow',
          'Referencing the Window in Angular expressions is disallowed! Expression: {0}',
          fullExpression);
    } else if (// isElement(obj)
        obj.children && (obj.nodeName || (obj.prop && obj.attr && obj.find))) {
      throw $parseMinErr('isecdom',
          'Referencing DOM nodes in Angular expressions is disallowed! Expression: {0}',
          fullExpression);
    } else if (// block Object so that we can't get hold of dangerous Object.* methods
        obj === Object) {
      throw $parseMinErr('isecobj',
          'Referencing Object in Angular expressions is disallowed! Expression: {0}',
          fullExpression);
    }
  }
  return obj;
}

var CALL = Function.prototype.call;
var APPLY = Function.prototype.apply;
var BIND = Function.prototype.bind;

function ensureSafeFunction(obj, fullExpression) {
  if (obj) {
    if (obj.constructor === obj) {
      throw $parseMinErr('isecfn',
        'Referencing Function in Angular expressions is disallowed! Expression: {0}',
        fullExpression);
    } else if (obj === CALL || obj === APPLY || obj === BIND) {
      throw $parseMinErr('isecff',
        'Referencing call, apply or bind in Angular expressions is disallowed! Expression: {0}',
        fullExpression);
    }
  }
}

//Keyword constants
var CONSTANTS = createMap();
forEach({
  'null': function() { return null; },
  'true': function() { return true; },
  'false': function() { return false; },
  'undefined': function() {}
}, function(constantGetter, name) {
  constantGetter.constant = constantGetter.literal = constantGetter.sharedGetter = true;
  CONSTANTS[name] = constantGetter;
});

//Not quite a constant, but can be lex/parsed the same
CONSTANTS['this'] = function(self) { return self; };
CONSTANTS['this'].sharedGetter = true;


//Operators - will be wrapped by binaryFn/unaryFn/assignment/filter
var OPERATORS = extend(createMap(), {
    '+':function(self, locals, a, b) {
      a=a(self, locals); b=b(self, locals);
      if (isDefined(a)) {
        if (isDefined(b)) {
          return a + b;
        }
        return a;
      }
      return isDefined(b) ? b : undefined;},
    '-':function(self, locals, a, b) {
          a=a(self, locals); b=b(self, locals);
          return (isDefined(a) ? a : 0) - (isDefined(b) ? b : 0);
        },
    '*':function(self, locals, a, b) {return a(self, locals) * b(self, locals);},
    '/':function(self, locals, a, b) {return a(self, locals) / b(self, locals);},
    '%':function(self, locals, a, b) {return a(self, locals) % b(self, locals);},
    '===':function(self, locals, a, b) {return a(self, locals) === b(self, locals);},
    '!==':function(self, locals, a, b) {return a(self, locals) !== b(self, locals);},
    '==':function(self, locals, a, b) {return a(self, locals) == b(self, locals);},
    '!=':function(self, locals, a, b) {return a(self, locals) != b(self, locals);},
    '<':function(self, locals, a, b) {return a(self, locals) < b(self, locals);},
    '>':function(self, locals, a, b) {return a(self, locals) > b(self, locals);},
    '<=':function(self, locals, a, b) {return a(self, locals) <= b(self, locals);},
    '>=':function(self, locals, a, b) {return a(self, locals) >= b(self, locals);},
    '&&':function(self, locals, a, b) {return a(self, locals) && b(self, locals);},
    '||':function(self, locals, a, b) {return a(self, locals) || b(self, locals);},
    '!':function(self, locals, a) {return !a(self, locals);},

    //Tokenized as operators but parsed as assignment/filters
    '=':true,
    '|':true
});
var ESCAPE = {"n":"\n", "f":"\f", "r":"\r", "t":"\t", "v":"\v", "'":"'", '"':'"'};


/////////////////////////////////////////


/**
 * @constructor
 */
var Lexer = function(options) {
  this.options = options;
};

Lexer.prototype = {
  constructor: Lexer,

  lex: function(text) {
    this.text = text;
    this.index = 0;
    this.tokens = [];

    while (this.index < this.text.length) {
      var ch = this.text.charAt(this.index);
      if (ch === '"' || ch === "'") {
        this.readString(ch);
      } else if (this.isNumber(ch) || ch === '.' && this.isNumber(this.peek())) {
        this.readNumber();
      } else if (this.isIdent(ch)) {
        this.readIdent();
      } else if (this.is(ch, '(){}[].,;:?')) {
        this.tokens.push({index: this.index, text: ch});
        this.index++;
      } else if (this.isWhitespace(ch)) {
        this.index++;
      } else {
        var ch2 = ch + this.peek();
        var ch3 = ch2 + this.peek(2);
        var op1 = OPERATORS[ch];
        var op2 = OPERATORS[ch2];
        var op3 = OPERATORS[ch3];
        if (op1 || op2 || op3) {
          var token = op3 ? ch3 : (op2 ? ch2 : ch);
          this.tokens.push({index: this.index, text: token, operator: true});
          this.index += token.length;
        } else {
          this.throwError('Unexpected next character ', this.index, this.index + 1);
        }
      }
    }
    return this.tokens;
  },

  is: function(ch, chars) {
    return chars.indexOf(ch) !== -1;
  },

  peek: function(i) {
    var num = i || 1;
    return (this.index + num < this.text.length) ? this.text.charAt(this.index + num) : false;
  },

  isNumber: function(ch) {
    return ('0' <= ch && ch <= '9') && typeof ch === "string";
  },

  isWhitespace: function(ch) {
    // IE treats non-breaking space as \u00A0
    return (ch === ' ' || ch === '\r' || ch === '\t' ||
            ch === '\n' || ch === '\v' || ch === '\u00A0');
  },

  isIdent: function(ch) {
    return ('a' <= ch && ch <= 'z' ||
            'A' <= ch && ch <= 'Z' ||
            '_' === ch || ch === '$');
  },

  isExpOperator: function(ch) {
    return (ch === '-' || ch === '+' || this.isNumber(ch));
  },

  throwError: function(error, start, end) {
    end = end || this.index;
    var colStr = (isDefined(start)
            ? 's ' + start +  '-' + this.index + ' [' + this.text.substring(start, end) + ']'
            : ' ' + end);
    throw $parseMinErr('lexerr', 'Lexer Error: {0} at column{1} in expression [{2}].',
        error, colStr, this.text);
  },

  readNumber: function() {
    var number = '';
    var start = this.index;
    while (this.index < this.text.length) {
      var ch = lowercase(this.text.charAt(this.index));
      if (ch == '.' || this.isNumber(ch)) {
        number += ch;
      } else {
        var peekCh = this.peek();
        if (ch == 'e' && this.isExpOperator(peekCh)) {
          number += ch;
        } else if (this.isExpOperator(ch) &&
            peekCh && this.isNumber(peekCh) &&
            number.charAt(number.length - 1) == 'e') {
          number += ch;
        } else if (this.isExpOperator(ch) &&
            (!peekCh || !this.isNumber(peekCh)) &&
            number.charAt(number.length - 1) == 'e') {
          this.throwError('Invalid exponent');
        } else {
          break;
        }
      }
      this.index++;
    }
    this.tokens.push({
      index: start,
      text: number,
      constant: true,
      value: Number(number)
    });
  },

  readIdent: function() {
    var start = this.index;
    while (this.index < this.text.length) {
      var ch = this.text.charAt(this.index);
      if (!(this.isIdent(ch) || this.isNumber(ch))) {
        break;
      }
      this.index++;
    }
    this.tokens.push({
      index: start,
      text: this.text.slice(start, this.index),
      identifier: true
    });
  },

  readString: function(quote) {
    var start = this.index;
    this.index++;
    var string = '';
    var rawString = quote;
    var escape = false;
    while (this.index < this.text.length) {
      var ch = this.text.charAt(this.index);
      rawString += ch;
      if (escape) {
        if (ch === 'u') {
          var hex = this.text.substring(this.index + 1, this.index + 5);
          if (!hex.match(/[\da-f]{4}/i))
            this.throwError('Invalid unicode escape [\\u' + hex + ']');
          this.index += 4;
          string += String.fromCharCode(parseInt(hex, 16));
        } else {
          var rep = ESCAPE[ch];
          string = string + (rep || ch);
        }
        escape = false;
      } else if (ch === '\\') {
        escape = true;
      } else if (ch === quote) {
        this.index++;
        this.tokens.push({
          index: start,
          text: rawString,
          constant: true,
          value: string
        });
        return;
      } else {
        string += ch;
      }
      this.index++;
    }
    this.throwError('Unterminated quote', start);
  }
};


function isConstant(exp) {
  return exp.constant;
}

/**
 * @constructor
 */
var Parser = function(lexer, $filter, options) {
  this.lexer = lexer;
  this.$filter = $filter;
  this.options = options;
};

Parser.ZERO = extend(function() {
  return 0;
}, {
  sharedGetter: true,
  constant: true
});

Parser.prototype = {
  constructor: Parser,

  parse: function(text) {
    this.text = text;
    this.tokens = this.lexer.lex(text);

    var value = this.statements();

    if (this.tokens.length !== 0) {
      this.throwError('is an unexpected token', this.tokens[0]);
    }

    value.literal = !!value.literal;
    value.constant = !!value.constant;

    return value;
  },

  primary: function() {
    var primary;
    if (this.expect('(')) {
      primary = this.filterChain();
      this.consume(')');
    } else if (this.expect('[')) {
      primary = this.arrayDeclaration();
    } else if (this.expect('{')) {
      primary = this.object();
    } else if (this.peek().identifier) {
      primary = this.identifier();
    } else if (this.peek().constant) {
      primary = this.constant();
    } else {
      this.throwError('not a primary expression', this.peek());
    }

    var next, context;
    while ((next = this.expect('(', '[', '.'))) {
      if (next.text === '(') {
        primary = this.functionCall(primary, context);
        context = null;
      } else if (next.text === '[') {
        context = primary;
        primary = this.objectIndex(primary);
      } else if (next.text === '.') {
        context = primary;
        primary = this.fieldAccess(primary);
      } else {
        this.throwError('IMPOSSIBLE');
      }
    }
    return primary;
  },

  throwError: function(msg, token) {
    throw $parseMinErr('syntax',
        'Syntax Error: Token \'{0}\' {1} at column {2} of the expression [{3}] starting at [{4}].',
          token.text, msg, (token.index + 1), this.text, this.text.substring(token.index));
  },

  peekToken: function() {
    if (this.tokens.length === 0)
      throw $parseMinErr('ueoe', 'Unexpected end of expression: {0}', this.text);
    return this.tokens[0];
  },

  peek: function(e1, e2, e3, e4) {
    return this.peekAhead(0, e1, e2, e3, e4);
  },
  peekAhead: function(i, e1, e2, e3, e4) {
    if (this.tokens.length > i) {
      var token = this.tokens[i];
      var t = token.text;
      if (t === e1 || t === e2 || t === e3 || t === e4 ||
          (!e1 && !e2 && !e3 && !e4)) {
        return token;
      }
    }
    return false;
  },

  expect: function(e1, e2, e3, e4) {
    var token = this.peek(e1, e2, e3, e4);
    if (token) {
      this.tokens.shift();
      return token;
    }
    return false;
  },

  consume: function(e1) {
    if (this.tokens.length === 0) {
      throw $parseMinErr('ueoe', 'Unexpected end of expression: {0}', this.text);
    }

    var token = this.expect(e1);
    if (!token) {
      this.throwError('is unexpected, expecting [' + e1 + ']', this.peek());
    }
    return token;
  },

  unaryFn: function(op, right) {
    var fn = OPERATORS[op];
    return extend(function $parseUnaryFn(self, locals) {
      return fn(self, locals, right);
    }, {
      constant:right.constant,
      inputs: [right]
    });
  },

  binaryFn: function(left, op, right, isBranching) {
    var fn = OPERATORS[op];
    return extend(function $parseBinaryFn(self, locals) {
      return fn(self, locals, left, right);
    }, {
      constant: left.constant && right.constant,
      inputs: !isBranching && [left, right]
    });
  },

  identifier: function() {
    var id = this.consume().text;

    //Continue reading each `.identifier` unless it is a method invocation
    while (this.peek('.') && this.peekAhead(1).identifier && !this.peekAhead(2, '(')) {
      id += this.consume().text + this.consume().text;
    }

    return CONSTANTS[id] || getterFn(id, this.options, this.text);
  },

  constant: function() {
    var value = this.consume().value;

    return extend(function $parseConstant() {
      return value;
    }, {
      constant: true,
      literal: true
    });
  },

  statements: function() {
    var statements = [];
    while (true) {
      if (this.tokens.length > 0 && !this.peek('}', ')', ';', ']'))
        statements.push(this.filterChain());
      if (!this.expect(';')) {
        // optimize for the common case where there is only one statement.
        // TODO(size): maybe we should not support multiple statements?
        return (statements.length === 1)
            ? statements[0]
            : function $parseStatements(self, locals) {
                var value;
                for (var i = 0, ii = statements.length; i < ii; i++) {
                  value = statements[i](self, locals);
                }
                return value;
              };
      }
    }
  },

  filterChain: function() {
    var left = this.expression();
    var token;
    while ((token = this.expect('|'))) {
      left = this.filter(left);
    }
    return left;
  },

  filter: function(inputFn) {
    var fn = this.$filter(this.consume().text);
    var argsFn;
    var args;

    if (this.peek(':')) {
      argsFn = [];
      args = []; // we can safely reuse the array
      while (this.expect(':')) {
        argsFn.push(this.expression());
      }
    }

    var inputs = [inputFn].concat(argsFn || []);

    return extend(function $parseFilter(self, locals) {
      var input = inputFn(self, locals);
      if (args) {
        args[0] = input;

        var i = argsFn.length;
        while (i--) {
          args[i + 1] = argsFn[i](self, locals);
        }

        return fn.apply(undefined, args);
      }

      return fn(input);
    }, {
      constant: !fn.$stateful && inputs.every(isConstant),
      inputs: !fn.$stateful && inputs
    });
  },

  expression: function() {
    return this.assignment();
  },

  assignment: function() {
    var left = this.ternary();
    var right;
    var token;
    if ((token = this.expect('='))) {
      if (!left.assign) {
        this.throwError('implies assignment but [' +
            this.text.substring(0, token.index) + '] can not be assigned to', token);
      }
      right = this.ternary();
      return extend(function $parseAssignment(scope, locals) {
        return left.assign(scope, right(scope, locals), locals);
      }, {
        inputs: [left, right]
      });
    }
    return left;
  },

  ternary: function() {
    var left = this.logicalOR();
    var middle;
    var token;
    if ((token = this.expect('?'))) {
      middle = this.assignment();
      if (this.consume(':')) {
        var right = this.assignment();

        return extend(function $parseTernary(self, locals) {
          return left(self, locals) ? middle(self, locals) : right(self, locals);
        }, {
          constant: left.constant && middle.constant && right.constant
        });
      }
    }

    return left;
  },

  logicalOR: function() {
    var left = this.logicalAND();
    var token;
    while ((token = this.expect('||'))) {
      left = this.binaryFn(left, token.text, this.logicalAND(), true);
    }
    return left;
  },

  logicalAND: function() {
    var left = this.equality();
    var token;
    while ((token = this.expect('&&'))) {
      left = this.binaryFn(left, token.text, this.equality(), true);
    }
    return left;
  },

  equality: function() {
    var left = this.relational();
    var token;
    while ((token = this.expect('==','!=','===','!=='))) {
      left = this.binaryFn(left, token.text, this.relational());
    }
    return left;
  },

  relational: function() {
    var left = this.additive();
    var token;
    while ((token = this.expect('<', '>', '<=', '>='))) {
      left = this.binaryFn(left, token.text, this.additive());
    }
    return left;
  },

  additive: function() {
    var left = this.multiplicative();
    var token;
    while ((token = this.expect('+','-'))) {
      left = this.binaryFn(left, token.text, this.multiplicative());
    }
    return left;
  },

  multiplicative: function() {
    var left = this.unary();
    var token;
    while ((token = this.expect('*','/','%'))) {
      left = this.binaryFn(left, token.text, this.unary());
    }
    return left;
  },

  unary: function() {
    var token;
    if (this.expect('+')) {
      return this.primary();
    } else if ((token = this.expect('-'))) {
      return this.binaryFn(Parser.ZERO, token.text, this.unary());
    } else if ((token = this.expect('!'))) {
      return this.unaryFn(token.text, this.unary());
    } else {
      return this.primary();
    }
  },

  fieldAccess: function(object) {
    var expression = this.text;
    var field = this.consume().text;
    var getter = getterFn(field, this.options, expression);

    return extend(function $parseFieldAccess(scope, locals, self) {
      return getter(self || object(scope, locals));
    }, {
      assign: function(scope, value, locals) {
        var o = object(scope, locals);
        if (!o) object.assign(scope, o = {});
        return setter(o, field, value, expression);
      }
    });
  },

  objectIndex: function(obj) {
    var expression = this.text;

    var indexFn = this.expression();
    this.consume(']');

    return extend(function $parseObjectIndex(self, locals) {
      var o = obj(self, locals),
          i = indexFn(self, locals),
          v;

      ensureSafeMemberName(i, expression);
      if (!o) return undefined;
      v = ensureSafeObject(o[i], expression);
      return v;
    }, {
      assign: function(self, value, locals) {
        var key = ensureSafeMemberName(indexFn(self, locals), expression);
        // prevent overwriting of Function.constructor which would break ensureSafeObject check
        var o = ensureSafeObject(obj(self, locals), expression);
        if (!o) obj.assign(self, o = {});
        return o[key] = value;
      }
    });
  },

  functionCall: function(fnGetter, contextGetter) {
    var argsFn = [];
    if (this.peekToken().text !== ')') {
      do {
        argsFn.push(this.expression());
      } while (this.expect(','));
    }
    this.consume(')');

    var expressionText = this.text;
    // we can safely reuse the array across invocations
    var args = argsFn.length ? [] : null;

    return function $parseFunctionCall(scope, locals) {
      var context = contextGetter ? contextGetter(scope, locals) : isDefined(contextGetter) ? undefined : scope;
      var fn = fnGetter(scope, locals, context);

      if (!fn) {
        if (!context) {
          onUndefined(Object.keys(contextGetter));
        }
        fn = angular.noop;
      }

      if (args) {
        var i = argsFn.length;
        while (i--) {
          args[i] = ensureSafeObject(argsFn[i](scope, locals), expressionText);
        }
      }

      ensureSafeObject(context, expressionText);
      ensureSafeFunction(fn, expressionText);

      // IE doesn't have apply for some native functions
      var v = fn.apply
            ? fn.apply(context, args)
            : fn(args[0], args[1], args[2], args[3], args[4]);

      return ensureSafeObject(v, expressionText);
      };
  },

  // This is used with json array declaration
  arrayDeclaration: function() {
    var elementFns = [];
    if (this.peekToken().text !== ']') {
      do {
        if (this.peek(']')) {
          // Support trailing commas per ES5.1.
          break;
        }
        elementFns.push(this.expression());
      } while (this.expect(','));
    }
    this.consume(']');

    return extend(function $parseArrayLiteral(self, locals) {
      var array = [];
      for (var i = 0, ii = elementFns.length; i < ii; i++) {
        array.push(elementFns[i](self, locals));
      }
      return array;
    }, {
      literal: true,
      constant: elementFns.every(isConstant),
      inputs: elementFns
    });
  },

  object: function() {
    var keys = [], valueFns = [];
    if (this.peekToken().text !== '}') {
      do {
        if (this.peek('}')) {
          // Support trailing commas per ES5.1.
          break;
        }
        var token = this.consume();
        if (token.constant) {
          keys.push(token.value);
        } else if (token.identifier) {
          keys.push(token.text);
        } else {
          this.throwError("invalid key", token);
        }
        this.consume(':');
        valueFns.push(this.expression());
      } while (this.expect(','));
    }
    this.consume('}');

    return extend(function $parseObjectLiteral(self, locals) {
      var object = {};
      for (var i = 0, ii = valueFns.length; i < ii; i++) {
        object[keys[i]] = valueFns[i](self, locals);
      }
      return object;
    }, {
      literal: true,
      constant: valueFns.every(isConstant),
      inputs: valueFns
    });
  }
};


//////////////////////////////////////////////////
// Parser helper functions
//////////////////////////////////////////////////

function setter(obj, path, setValue, fullExp) {
  ensureSafeObject(obj, fullExp);

  var element = path.split('.'), key;
  for (var i = 0; element.length > 1; i++) {
    key = ensureSafeMemberName(element.shift(), fullExp);
    var propertyObj = ensureSafeObject(obj[key], fullExp);
    if (!propertyObj) {
      propertyObj = {};
      obj[key] = propertyObj;
    }
    obj = propertyObj;
  }
  key = ensureSafeMemberName(element.shift(), fullExp);
  ensureSafeObject(obj[key], fullExp);
  obj[key] = setValue;
  return setValue;
}

var getterFnCacheDefault = createMap();
var getterFnCacheExpensive = createMap();

function isPossiblyDangerousMemberName(name) {
  return name == 'constructor';
}

/**
 * Implementation of the "Black Hole" variant from:
 * - http://jsperf.com/angularjs-parse-getter/4
 * - http://jsperf.com/path-evaluation-simplified/7
 */
function cspSafeGetterFn(key0, key1, key2, key3, key4, fullExp, expensiveChecks) {
  ensureSafeMemberName(key0, fullExp);
  ensureSafeMemberName(key1, fullExp);
  ensureSafeMemberName(key2, fullExp);
  ensureSafeMemberName(key3, fullExp);
  ensureSafeMemberName(key4, fullExp);
  var eso = function(o) {
    return ensureSafeObject(o, fullExp);
  };
  var eso0 = (expensiveChecks || isPossiblyDangerousMemberName(key0)) ? eso : identity;
  var eso1 = (expensiveChecks || isPossiblyDangerousMemberName(key1)) ? eso : identity;
  var eso2 = (expensiveChecks || isPossiblyDangerousMemberName(key2)) ? eso : identity;
  var eso3 = (expensiveChecks || isPossiblyDangerousMemberName(key3)) ? eso : identity;
  var eso4 = (expensiveChecks || isPossiblyDangerousMemberName(key4)) ? eso : identity;

  return function cspSafeGetter(scope, locals) {
    var pathVal = (locals && locals.hasOwnProperty(key0)) ? locals : scope;

    if (pathVal == null) return pathVal;
    pathVal = eso0(pathVal[key0]);

    if (!key1) return pathVal;
    if (pathVal == null) { onUndefined(key0); return };
    pathVal = eso1(pathVal[key1]);

    if (!key2) return pathVal;
    if (pathVal == null) { onUndefined([key0, key1].join('.')); return };
    pathVal = eso2(pathVal[key2]);

    if (!key3) return pathVal;
    if (pathVal == null) { onUndefined([key0, key1, key2].join('.')); return };
    pathVal = eso3(pathVal[key3]);

    if (!key4) return pathVal;
    if (pathVal == null) { onUndefined([key0, key1, key2, key3].join('.')); return };
    pathVal = eso4(pathVal[key4]);

    if (pathVal == null) { onUndefined([key0, key1, key2, key3, key4].join('.')); return };
    return pathVal;
  };
}

function getterFnWithEnsureSafeObject(fn, fullExpression) {
  return function(s, l) {
    return fn(s, l, ensureSafeObject, fullExpression);
  };
}

function getterFn(path, options, fullExp) {
  var expensiveChecks = options.expensiveChecks;
  var getterFnCache = (expensiveChecks ? getterFnCacheExpensive : getterFnCacheDefault);
  var fn = getterFnCache[path];
  if (fn) return fn;


  var pathKeys = path.split('.'),
      pathKeysLength = pathKeys.length;

  if (pathKeysLength < 6) {
    fn = cspSafeGetterFn(pathKeys[0], pathKeys[1], pathKeys[2], pathKeys[3], pathKeys[4], fullExp, expensiveChecks);
  } else {
    fn = function cspSafeGetter(scope, locals) {
      var i = 0, val;
      do {
        val = cspSafeGetterFn(pathKeys[i++], pathKeys[i++], pathKeys[i++], pathKeys[i++],
                              pathKeys[i++], fullExp, expensiveChecks)(scope, locals);
        locals = undefined; // clear after first iteration
        scope = val;
      } while (i < pathKeysLength);
      cspSafeGetter.undefinedPath = fn.undefinedPath;
      return val;
    };
  }

  fn.sharedGetter = true;
  fn.assign = function(self, value) {
    return setter(self, path, value, path);
  };
  getterFnCache[path] = fn;
  return fn;
}

var objectValueOf = Object.prototype.valueOf;

function getValueOf(value) {
  return isFunction(value.valueOf) ? value.valueOf() : objectValueOf.call(value);
}

///////////////////////////////////

/**
 * @ngdoc service
 * @name $parse
 * @kind function
 *
 * @description
 *
 * Converts Angular {@link guide/expression expression} into a function.
 *
 * ```js
 *   var getter = $parse('user.name');
 *   var setter = getter.assign;
 *   var context = {user:{name:'angular'}};
 *   var locals = {user:{name:'local'}};
 *
 *   expect(getter(context)).toEqual('angular');
 *   setter(context, 'newValue');
 *   expect(context.user.name).toEqual('newValue');
 *   expect(getter(context, locals)).toEqual('local');
 * ```
 *
 *
 * @param {string} expression String expression to compile.
 * @returns {function(context, locals)} a function which represents the compiled expression:
 *
 *    * `context` – `{object}` – an object against which any expressions embedded in the strings
 *      are evaluated against (typically a scope object).
 *    * `locals` – `{object=}` – local variables context object, useful for overriding values in
 *      `context`.
 *
 *    The returned function also has the following properties:
 *      * `literal` – `{boolean}` – whether the expression's top-level node is a JavaScript
 *        literal.
 *      * `constant` – `{boolean}` – whether the expression is made entirely of JavaScript
 *        constant literals.
 *      * `assign` – `{?function(context, value)}` – if the expression is assignable, this will be
 *        set to a function to change its value on the given context.
 *
 */


var onUndefined = angular.noop;



/**
 * @ngdoc provider
 * @name $parseProvider
 *
 * @description
 * `$parseProvider` can be used for configuring the default behavior of the {@link ng.$parse $parse}
 *  service.
 */
module.exports = function $ParseProvider() {
  var cacheDefault = createMap();
  var cacheExpensive = createMap();



  this.$get = ['$filter', '$sniffer', function($filter, $sniffer) {
    var $parseOptions = {
          csp: $sniffer.csp,
          expensiveChecks: false
        },
        $parseOptionsExpensive = {
          csp: $sniffer.csp,
          expensiveChecks: true
        };

    function wrapSharedExpression(exp) {
      var wrapped = exp;

      if (exp.sharedGetter) {
        wrapped = function $parseWrapper(self, locals) {
          return exp(self, locals);
        };
        wrapped.literal = exp.literal;
        wrapped.constant = exp.constant;
        wrapped.assign = exp.assign;
      }

      return wrapped;
    }

    return function $parse(exp, interceptorFn, expensiveChecks) {
      var parsedExpression, oneTime, cacheKey;

      switch (typeof exp) {
        case 'string':
          cacheKey = exp = exp.trim();

          var cache = (expensiveChecks ? cacheExpensive : cacheDefault);
          parsedExpression = cache[cacheKey];

          if (!parsedExpression) {
            if (exp.charAt(0) === ':' && exp.charAt(1) === ':') {
              oneTime = true;
              exp = exp.substring(2);
            }

            var parseOptions = expensiveChecks ? $parseOptionsExpensive : $parseOptions;
            var lexer = new Lexer(parseOptions);
            var parser = new Parser(lexer, $filter, parseOptions);
            parsedExpression = parser.parse(exp);

            if (parsedExpression.constant) {
              parsedExpression.$$watchDelegate = constantWatchDelegate;
            } else if (oneTime) {
              //oneTime is not part of the exp passed to the Parser so we may have to
              //wrap the parsedExpression before adding a $$watchDelegate
              parsedExpression = wrapSharedExpression(parsedExpression);
              parsedExpression.$$watchDelegate = parsedExpression.literal ?
                oneTimeLiteralWatchDelegate : oneTimeWatchDelegate;
            } else if (parsedExpression.inputs) {
              parsedExpression.$$watchDelegate = inputsWatchDelegate;
            }

            cache[cacheKey] = parsedExpression;
          }
          return addInterceptor(parsedExpression, interceptorFn);

        case 'function':
          return addInterceptor(exp, interceptorFn);

        default:
          return addInterceptor(noop, interceptorFn);
      }
    };

    function collectExpressionInputs(inputs, list) {
      for (var i = 0, ii = inputs.length; i < ii; i++) {
        var input = inputs[i];
        if (!input.constant) {
          if (input.inputs) {
            collectExpressionInputs(input.inputs, list);
          } else if (list.indexOf(input) === -1) { // TODO(perf) can we do better?
            list.push(input);
          }
        }
      }

      return list;
    }

    function expressionInputDirtyCheck(newValue, oldValueOfValue) {

      if (newValue == null || oldValueOfValue == null) { // null/undefined
        return newValue === oldValueOfValue;
      }

      if (typeof newValue === 'object') {

        // attempt to convert the value to a primitive type
        // TODO(docs): add a note to docs that by implementing valueOf even objects and arrays can
        //             be cheaply dirty-checked
        newValue = getValueOf(newValue);

        if (typeof newValue === 'object') {
          // objects/arrays are not supported - deep-watching them would be too expensive
          return false;
        }

        // fall-through to the primitive equality check
      }

      //Primitive or NaN
      return newValue === oldValueOfValue || (newValue !== newValue && oldValueOfValue !== oldValueOfValue);
    }

    function inputsWatchDelegate(scope, listener, objectEquality, parsedExpression) {
      var inputExpressions = parsedExpression.$$inputs ||
                    (parsedExpression.$$inputs = collectExpressionInputs(parsedExpression.inputs, []));

      var lastResult;

      if (inputExpressions.length === 1) {
        var oldInputValue = expressionInputDirtyCheck; // init to something unique so that equals check fails
        inputExpressions = inputExpressions[0];
        return scope.$watch(function expressionInputWatch(scope) {
          var newInputValue = inputExpressions(scope);
          if (!expressionInputDirtyCheck(newInputValue, oldInputValue)) {
            lastResult = parsedExpression(scope);
            oldInputValue = newInputValue && getValueOf(newInputValue);
          }
          return lastResult;
        }, listener, objectEquality);
      }

      var oldInputValueOfValues = [];
      for (var i = 0, ii = inputExpressions.length; i < ii; i++) {
        oldInputValueOfValues[i] = expressionInputDirtyCheck; // init to something unique so that equals check fails
      }

      return scope.$watch(function expressionInputsWatch(scope) {
        var changed = false;

        for (var i = 0, ii = inputExpressions.length; i < ii; i++) {
          var newInputValue = inputExpressions[i](scope);
          if (changed || (changed = !expressionInputDirtyCheck(newInputValue, oldInputValueOfValues[i]))) {
            oldInputValueOfValues[i] = newInputValue && getValueOf(newInputValue);
          }
        }

        if (changed) {
          lastResult = parsedExpression(scope);
        }

        return lastResult;
      }, listener, objectEquality);
    }

    function oneTimeWatchDelegate(scope, listener, objectEquality, parsedExpression) {
      var unwatch, lastValue;
      return unwatch = scope.$watch(function oneTimeWatch(scope) {
        return parsedExpression(scope);
      }, function oneTimeListener(value, old, scope) {
        lastValue = value;
        if (isFunction(listener)) {
          listener.apply(this, arguments);
        }
        if (isDefined(value)) {
          scope.$$postDigest(function() {
            if (isDefined(lastValue)) {
              unwatch();
            }
          });
        }
      }, objectEquality);
    }

    function oneTimeLiteralWatchDelegate(scope, listener, objectEquality, parsedExpression) {
      var unwatch, lastValue;
      return unwatch = scope.$watch(function oneTimeWatch(scope) {
        return parsedExpression(scope);
      }, function oneTimeListener(value, old, scope) {
        lastValue = value;
        if (isFunction(listener)) {
          listener.call(this, value, old, scope);
        }
        if (isAllDefined(value)) {
          scope.$$postDigest(function() {
            if (isAllDefined(lastValue)) unwatch();
          });
        }
      }, objectEquality);

      function isAllDefined(value) {
        var allDefined = true;
        forEach(value, function(val) {
          if (!isDefined(val)) allDefined = false;
        });
        return allDefined;
      }
    }

    function constantWatchDelegate(scope, listener, objectEquality, parsedExpression) {
      var unwatch;
      return unwatch = scope.$watch(function constantWatch(scope) {
        return parsedExpression(scope);
      }, function constantListener(value, old, scope) {
        if (isFunction(listener)) {
          listener.apply(this, arguments);
        }
        unwatch();
      }, objectEquality);
    }

    function addInterceptor(parsedExpression, interceptorFn) {
      if (!interceptorFn) return parsedExpression;
      var watchDelegate = parsedExpression.$$watchDelegate;

      var regularWatch =
          watchDelegate !== oneTimeLiteralWatchDelegate &&
          watchDelegate !== oneTimeWatchDelegate;

      var fn = regularWatch ? function regularInterceptedExpression(scope, locals) {
        var value = parsedExpression(scope, locals);
        return interceptorFn(value, scope, locals);
      } : function oneTimeInterceptedExpression(scope, locals) {
        var value = parsedExpression(scope, locals);
        var result = interceptorFn(value, scope, locals);
        // we only return the interceptor's result if the
        // initial value is defined (for bind-once)
        return isDefined(value) ? result : value;
      };

      // Propagate $$watchDelegates other then inputsWatchDelegate
      if (parsedExpression.$$watchDelegate &&
          parsedExpression.$$watchDelegate !== inputsWatchDelegate) {
        fn.$$watchDelegate = parsedExpression.$$watchDelegate;
      } else if (!interceptorFn.$stateful) {
        // If there is an interceptor, but no watchDelegate then treat the interceptor like
        // we treat filters - it is assumed to be a pure function unless flagged with $stateful
        fn.$$watchDelegate = inputsWatchDelegate;
        fn.inputs = [parsedExpression];
      }

      return fn;
    }
  }];
}

/*
 * welcome to the worst API i've created today
 */
module.exports.onUndefined = function (cb) {
  onUndefined = cb;
};
