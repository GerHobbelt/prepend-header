#!/bin/sh
setup() {
  rm -rf test/output
  mkdir -p test/output
  echo 'xxx' >'test/output/f1.js'
  echo 'xxx' >'test/output/f2.js'
  echo 'xxx' >'test/output/f3.js'
  echo '#!/usr/bin/env node' >  'test/output/cli1.js'
  echo 'xxx'                 >> 'test/output/cli1.js'
  echo '#!/usr/bin/env node' >  'test/output/cli2.js'
  echo 'xxx'                 >> 'test/output/cli2.js'
  echo '#!/usr/bin/env node' >  'test/output/cli3.js'
  echo 'xxx'                 >> 'test/output/cli3.js'
}

set -f # disable wildcard expansion
run_test() {
  header_path=$2
  file_path=$1
  #setup
  echo [FILES from $file_path]
  node . $file_path $header_path
  echo "------"
}

setup

run_test test/output/f1.js test/header-1.js
run_test test/output/f2.js test/header-2.cjs
run_test test/output/f3.js test/header-3.mjs

run_test test/output/cli1.js test/header-1.js
run_test test/output/cli2.js test/header-2.cjs
run_test test/output/cli3.js test/header-3.mjs
