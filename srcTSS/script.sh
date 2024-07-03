#!/bin/bash
find ./js/map/plugins/ -type f -name '*.ts' | while read -r file; do
	mv "$file" "${file%.*}.js"
done
