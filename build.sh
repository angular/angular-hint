#!/bin/bash

DEP=node_modules

cat prefix.js \
    $DEP/angular-hint-dom/$DEP/zone.js/zone.js \
    $DEP/angular-hint-dom/$DEP/dom-interceptor/dom-interceptor.js \
    $DEP/angular-hint-dom/domDecorator.js \
    $DEP/angular-hint-directives/dd-lib/dd-lib.js \
    $DEP/angular-hint-directives/decorator.js \
    load.js \
    suffix.js > hint.js
