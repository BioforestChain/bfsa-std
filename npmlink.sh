#!/bin/bash

# 快速npm link 方便测试

dirctory=("plugin")

for dir in ${dirctory[@]}
do
    cd ./build/$dir/ && pwd && npm link && cd ../../
done


cd ../plaoc/test/vue3/ && npm link @bfsx/plugin

# cd ./bfsa-service && pwd && npm link @bfsx/core && npm link @bfsx/metadata && npm link @bfsx/typings
