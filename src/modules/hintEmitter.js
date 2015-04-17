'use strict';

/**
 * We use EventEmitter2 here in order to have scoped events
 * For instance:
 *    hint.emit('scope:digest', {
 */
var EventEmitter2 = require('eventemitter2').EventEmitter2;

angular.hint = new EventEmitter2({
  wildcard: true,
  delimiter: ':'
});