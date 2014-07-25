var log = document.getElementById('console');
angular.hint.onMessage = function(message) {
  log.innerHTML += message;
};