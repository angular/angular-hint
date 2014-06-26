#!/bin/bash

DEP=node_modules

DOM=
#DIRECTIVE=$DEP/

cat prefix.js \
    $DEP/angular-hint-directive/dd-lib/dd-lib.js \
    $DEP/angular-hint-directive/decorator.js \
    load.js \
    suffix.js > hint.js
