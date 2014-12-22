'use strict';

var getValidProps = require('./getValidProps'),
  suggest = require('suggest-it');

module.exports = function addSuggestions(messages) {
  messages.forEach(function(messageObj) {
    var dictionary = getValidProps(messageObj.scope),
      suggestion = suggest(dictionary)(messageObj.boundFunc);
    messageObj['match'] = suggestion;
  });
  return messages;
};
