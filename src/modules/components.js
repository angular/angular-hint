'use strict';

var MODULE_NAME = 'Components';

var SUPPORTED_COMPONENT_OPTIONS = [
    'bindings',
    'controller',
    'controllerAs',
    'require',
    'template',
    'templateUrl',
    'transclude'
];

var originalModule = angular.module;


angular.module = function moduleDecorator() {
    var module = originalModule.apply(this, arguments);
    var originalComponent = module.component;
    module.component = function componentDecorator(componentName, componentOptions) {
        verifyComponent(componentName, componentOptions);
        return originalComponent.apply(this, arguments);
    };

    return module
};

function verifyComponent(componentName, componentOptions) {
    verifyComponentName(componentName);
    verifyComponentOptions(componentName, componentOptions);
}
function verifyComponentName(componentName){
    if(typeof componentName === 'string'){
        if(componentName.slice(0,2).toLowerCase() === 'ng'){
            sendMessageForBadComponentName(componentName);
        }
    }
}

function sendMessageForBadComponentName(componentName){
    angular.hint.emit(MODULE_NAME, ':rename Consider renaming `' + componentName + '`because only angular directive should start with ng.');
}

function verifyComponentOptions(componentName, componentOptions) {
    Object.keys(componentOptions).forEach(function(key){
        if(!isSupportedComponentOption(key)) {
            sendMessageForUnSupportedComponentOption(componentName, key);
        }
    });
}

function isSupportedComponentOption(option){
    return (SUPPORTED_COMPONENT_OPTIONS.indexOf(option) >= 0);
};

function sendMessageForUnSupportedComponentOption(componentName, componentOption){
    angular.hint.emit(MODULE_NAME, ':`' + componentOption + '` option is not a supported option for `' + componentName + '`component.');
}

