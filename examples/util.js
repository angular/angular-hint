/*
 * override console.* APIs to write to DOM
 * in E2E tests so protractor can see the output
 */

'use strict';

var log = document.getElementById('console');
function logToElement() {
  log.innerHTML += Array.prototype.slice.call(arguments).join('; ') + '; ';
}

if (console.groupCollapsed) {
  console.groupCollapsed = logToElement;
}

if (console.group) {
  console.group = logToElement;
}

console.groupEnd = function() {};

console._log = console.log;
console.log = logToElement;
