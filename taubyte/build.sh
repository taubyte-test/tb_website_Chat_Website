# !/bin/bash

set +x

env

(which npx) || npm install -g npx

mkdir out

cp -r backend frontend/* out

ls -lh out

exit 0

set -a pids

cd out
for name in $(find . -iname "*.html" -o -iname "*.js" -o -iname "*.css")
do
   (
    echo $name
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