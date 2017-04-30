'use strict';


var MODULE_NAME = 'Directives';

var SUPPORTED_DIRECTIVE_OPTIONS = [
    'multiElement',
    'priority',
    'terminal',
    'scope',
    'bindToController',
    'controller',
    'require',
    'controllerAs',
    'restrict',
    'templateNamespace',
    'template',
    'templateUrl',
    'replace',
    'transclude',
    'compile',
    'link'
];

var originalModule = angular.module;


angular.module = function moduleDecorator(){
    var module = originalModule.apply(this, arguments);
    var originalDirective = module.directive;

    module.directive = function directiveDecorator(directiveName, options) {
        var directiveFactory;
        if (typeof directiveName === 'string') {
            if (Array.isArray(options) && options.length > 0) {
                directiveFactory = options[options.length - 1];
            } else {
                directiveFactory = options;
            }
            verifyDirective(directiveName, directiveFactory);
        } else if (typeof directiveName === 'object') {
            Object.keys(directiveName).forEach(function (key) {
                directiveFactory = directiveName[key];
                verifyDirective(key, directiveFactory);
            });
        }
        return originalDirective.apply(this, arguments);
    };

    return module;
};


function verifyDirective(directiveName, directiveFactory) {
    verifyDirectiveName(directiveName);
    verifyDirectiveOptions(directiveName, directiveFactory);
}
function verifyDirectiveName(directiveName){
    if(typeof directiveName === 'string'){
        if(directiveName.slice(0,2).toLowerCase() === 'ng'){
            sendMessageForBadDirectiveName(directiveName);
        }
    }
}

function sendMessageForBadDirectiveName(directiveName){
    angular.hint.emit(MODULE_NAME, ':rename Consider renaming `' + directiveName + '`because only angular directive should start with ng.');
}

function verifyDirectiveOptions(directiveName, directiveFactory) {
    var options = directiveFactory.call();
    Object.keys(options).forEach(function(key){
        if(!isSupportedDirectiveOption(key)) {
            sendMessageForUnSupportedDirectiveOption(directiveName, key);
        }
    });
}

function isSupportedDirectiveOption(option){
  return (SUPPORTED_DIRECTIVE_OPTIONS.indexOf(option) >= 0);
};

function sendMessageForUnSupportedDirectiveOption(directiveName, directiveOption){
    angular.hint.emit(MODULE_NAME, ':`' + directiveOption + '` option is not a supported option for `' + directiveName + '`directive.');
}
