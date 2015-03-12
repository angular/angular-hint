#! /bin/bash
SCRIPT_DIR=$(dirname $0)
cd $SCRIPT_DIR/..

function killServer {
  kill $serverPid
}

./node_modules/.bin/gulp build
./node_modules/.bin/gulp serve &
serverPid=$!

trap killServer EXIT

SAUCE_ACCESS_KEY=`echo $SAUCE_ACCESS_KEY | rev`

#./node_modules/.bin/protractor protractor.conf.js --travis &
karma start karma.conf.js --sauce &
wait %2
#wait %2 %3
