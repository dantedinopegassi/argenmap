#!/bin/bash
find ./js/plugins/ -type f -name '*.ts' | while read -r file; do
	mv "$file" "${file%.*}.js"
done
