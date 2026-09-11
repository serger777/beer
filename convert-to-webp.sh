#!/bin/bash

# Конвертируем большие PNG файлы (>1MB) в WebP
# Маленькие файлы (<1MB) оставляем как есть

echo "Converting large PNG files to WebP..."

# Большие background файлы (>1MB)
cwebp -q 85 images/product/line/aero-bg.png -o images/product/line/aero-bg.webp
cwebp -q 85 images/product/line/amti-lager-1-bg.png -o images/product/line/amti-lager-1-bg.webp
cwebp -q 85 images/product/line/kriek-bg.png -o images/product/line/kriek-bg.webp
cwebp -q 85 images/product/line/lgaer-bg.png -o images/product/line/lgaer-bg.webp
cwebp -q 85 images/product/line/fade.png -o images/product/line/fade.webp

echo "Conversion complete!"
echo "Remember to update HTML/CSS to use .webp files"
