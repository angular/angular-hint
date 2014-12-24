'use strict';

/*
 * HintLog creates a queue of messages logged by ngHint modules. This object
 * has a key for each ngHint module that corresponds to the messages
 * from that module.
 */
var queuedMessages = {};

angular.hint = angular.hint || {};

var MESSAGE_TYPES = [
  'error',
  'warning',
  'suggestion'
];

/*
 * Add a message to the HintLog message queue. Messages are organized into categories
 * according to their module name and severity.
 */
function logMessage(moduleName, message, severity, category) {
  // If no severity was provided, categorize the message as a `suggestion`
  severity = severity || 3;
  var messageType = MESSAGE_TYPES[severity - 1];

  moduleName = moduleName || 'General';

  // If the category does not exist, initialize a new object
  queuedMessages[moduleName] = queuedMessages[moduleName] || {};
  queuedMessages[moduleName][messageType] = queuedMessages[moduleName][messageType] || [];

  if (queuedMessages[moduleName][messageType].indexOf(message) < 0) {
    queuedMessages[moduleName][messageType].push(message);
  }

  this.onMessage(moduleName, message, messageType, category);
}

/*
 * Return and empty the current queue of messages.
 */
function flush() {
  var flushMessages = queuedMessages;
  queuedMessages = {};
  return flushMessages;
}

angular.hint.onMessage = function(message) {};
angular.hint.log = logMessage;
angular.hint.flush = flush;
