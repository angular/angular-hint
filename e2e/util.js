var log = document.getElementById('console');
var original = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
angular.hint.onMessage = function(message) {
  if(original && typeof original.get === 'function' && typeof original.set == 'function') {
    Object.defineProperty(log, 'innerHTML', {
      get: original.get,
      set: original.set
    });
  }
  log.innerHTML += message;
};