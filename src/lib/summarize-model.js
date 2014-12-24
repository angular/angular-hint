'use strict';

module.exports = function summarizeModel (model) {

  if (model instanceof Array) {
    return JSON.stringify(model.map(summarizeProperty));
  } else if (typeof model === 'object') {
    return JSON.stringify(Object.
        keys(model).
        filter(isAngularPrivatePropertyName).
        reduce(shallowSummary, {}));
  } else {
    return model;
  }

  function shallowSummary (obj, prop) {
    obj[prop] = summarizeProperty(model[prop]);
    return obj;
  }
};

function isAngularPrivatePropertyName (key) {
  return !(key[0] === '$' && key[1] === '$') && key !== '$parent' && key !== '$root';
}

// TODO: handle DOM nodes, fns, etc better.
function summarizeProperty (obj) {
  return obj instanceof Array ?
      { '~array-length': obj.length } :
    obj === null ?
      null :
    typeof obj === 'object' ?
      { '~object': true } :
      obj;
}
