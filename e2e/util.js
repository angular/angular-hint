var log = document.getElementById('console');
// angular.hint.onMessage = function(message) {
//   log.innerHTML += message;
// };
if(console.groupCollapsed) {
  console.groupCollapsed = function() {
    for(var i = 0, ii = arguments.length; i < ii; i++) {
      log.innerHTML += arguments[i];
    }
  }
}

console.groupEnd = function() {};

console.log = function() {
  for(var i = 0, ii = arguments.length; i < ii; i++) {
    log.innerHTML += arguments[i];
  }
}