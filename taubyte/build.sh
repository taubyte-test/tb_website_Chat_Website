# !/bin/bash

(which npx) || npm install -g npx

cp -r backend frontend/* out
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