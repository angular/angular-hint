#!/bin/bash

cd "`dirname $0`/.."
yarn add angular@$VERSION angular-mocks@$VERSION angular-route@$VERSION --ignore-engines
cd -
