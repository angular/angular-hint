var inAttrsOrClasses = require('../src/modules/angular-hint-modules/inAttrsOrClasses');

describe('inAttrsOrClasses()', function() {
  it('should identify if ng-view exists in the attributes', function() {
    var attrs = [
      {nodeName: 'id', value:'#testVal'},
      {nodeName: 'width', value:'100px'},
      {nodeName: 'ng-view', value:''}];
    var res = inAttrsOrClasses(attrs);
    expect(res).toBe(true);
  });
  it('should identify if ng-view exists in the class attribute', function() {
    var attrs = [
      {nodeName: 'id', value:'#testVal'},
      {nodeName: 'width', value:'100px'},
      {nodeName: 'class', value:'ng-view'}];
    var res = inAttrsOrClasses(attrs);
    expect(res).toBe(true);
  });
  it('should identify if ng-view does not exist', function() {
    var attrs = [
      {nodeName: 'id', value:'#testVal'},
      {nodeName: 'width', value:'100px'},
      {nodeName: 'height', value:'auto'}];
    var res = inAttrsOrClasses(attrs);
    expect(res).toBe(undefined);
  });
});