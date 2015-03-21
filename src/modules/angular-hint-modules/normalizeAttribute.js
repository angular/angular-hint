module.exports = function(attribute) {
  return attribute.replace(/^(?:data|x)[-_:]/, '').replace(/[:_]/g, '-');
};
