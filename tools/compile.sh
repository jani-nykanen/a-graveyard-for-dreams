#!/bin/sh
cd "$(dirname "$0")"
java -jar closure.jar --js ../src/core/*.js ../src/*.js --js_output_file out.js --compilation_level ADVANCED_OPTIMIZATIONS --language_out ECMASCRIPT_2018
