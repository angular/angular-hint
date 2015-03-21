var normalizeAttribute = require('./normalizeAttribute');

module.exports = function(attrs) {
  for(var i = 0, length = attrs.length; i < length; i++) {
    if(normalizeAttribute(attrs[i].nodeName) === 'ng-view' ||
        attrs[i].value.indexOf('ng-view') > -1) {
          return true;
    }
  }
};
