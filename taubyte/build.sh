#!/bin/bash

set +x

exec 2>&1

(
    (which npx) || npm install -g npx

    rm -fr /out/*
)

cp -r backend frontend/* /out

cd /out
for name in $(find . -iname "*.html" -o -iname "*.js" -o -iname "*.css")
do
    npx minify ${name} > ${name}.min
    rm ${name}
    mv ${name}.min ${name}
done
