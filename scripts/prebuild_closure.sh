#!/bin/bash

set -e -o pipefail

echo "Starting Closure Compile build"
rm -rf temp/
rm -rf dist/
rm -rf node_modules/@ng-bootstrap/ng-bootstrap/
mkdir -p dist/demo
mkdir -p dist/demo/css
mkdir -p dist/demo/js

echo "Building the lib into ./node_modules/@ng-bootstrap/ng-bootstrap"
node node_modules/@angular/tsc-wrapped/src/main -p tsconfig-closure-lib.json
mkdir -p node_modules/@ng-bootstrap/ng-bootstrap
mv ./temp/* ./node_modules/@ng-bootstrap/ng-bootstrap

echo "Building the demo into ./temp/demo"
gulp generate-docs
gulp generate-plunks
cp -R ./demo/src/ ./temp/src
node ./scripts/prebuild-prism.js
./node_modules/.bin/ngc -p tsconfig-closure-demo-aot.json
node node_modules/@angular/tsc-wrapped/src/main -p tsconfig-closure-demo.json

echo "Copying statics to ./dist/demo"
cp -R ./demo/src/public/ ./dist/demo/
./node_modules/.bin/node-sass ./demo/src/style/app.scss ./dist/demo/css/app.css
cat node_modules/bootstrap/dist/css/bootstrap.css <(echo) node_modules/prismjs/themes/prism.css dist/demo/css/app.css > dist/demo/css/all.css
cat node_modules/core-js/client/core.min.js <(echo) node_modules/zone.js/dist/zone.min.js > dist/demo/js/vendors.js

