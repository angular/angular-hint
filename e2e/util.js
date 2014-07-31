var log = document.getElementById('console');
if(console.groupCollapsed) {
  console.groupCollapsed = function() {
    for(var i = 0, ii = arguments.length; i < ii; i++) {
      log.innerHTML += arguments[i];
    }
  };
}

console.groupEnd = function() {};

console.log = function() {
  for(var i = 0, ii = arguments.length; i < ii; i++) {
    log.innerHTML += arguments[i];
  }
};