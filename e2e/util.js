
// For test cases, log the console to an HTML element that can be retrieved by protractor
console.groupCollapsed = function(message) {
  var log = document.getElementById('console');
  log.innerHTML += message;
};

console.group = function(message) {
  var log = document.getElementById('console');
  log.innerHTML += message;
};

console.log = function(message) {
  var log = document.getElementById('console');
  log.innerHTML += message;
};
