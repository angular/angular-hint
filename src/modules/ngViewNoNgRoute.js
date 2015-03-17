var modData = require('./moduleData'),
  getModule = require('./getModule');

module.exports = function() {
  if(modData.ngViewExists && !getModule('ngRoute')) {
    return {message: 'Directive "ngView" was used in the application however "ngRoute" was not loaded into any module.'};
  }
};
