# !/bin/bash

set +x

exec 2>&1

(
    (which npx) || npm install -g npx

    test -d out || mkdir -p "out"
    rm -fr out/*
) || true

cp -r backend frontend/* out

set -a pids

cd out
for name in $(find . -iname "*.html" -o -iname "*.js" -o -iname "*.css")
do
   (
    npx minify ${name} > ${name}.min
    rm ${name}
    mv ${name}{.min,}
   ) &
   pids+=( $! )
done

# wait for all pids
for pid in ${pids[@]}; do
    wait $pid
done