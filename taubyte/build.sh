# !/bin/bash

echo "here 1"

set +x

echo "here 2"

exec 2>&1

echo "here 3"

(
    (which npx) || npm install -g npx

    test -d out || mkdir -p "out"
    rm -fr out/*
) || true

echo "here 4"

cp -r backend frontend/* out

echo "here 5"

set -a pids

cd out
for name in $(find . -iname "*.html" -o -iname "*.js" -o -iname "*.css")
do
    npx minify ${name} > ${name}.min
    rm ${name}
    mv ${name}.min ${name}
done
