# Clustered Landcover Classification with Landsat 8 (Unsupervised)

This project demonstrates unsupervised landcover classification using K-means clustering on Landsat 8 Surface Reflectance data via Google Earth Engine (GEE).

## ✅ Overview

- **Area of Interest**: South Africa (rectangle bounding box)
- **Sensor**: Landsat 8 Collection 2, Level 2 Surface Reflectance
- **Date Range**: 2017-01-01 to 2017-12-31
- **Method**: Unsupervised classification using K-means (15 clusters)
- **Tool**: Google Earth Engine JavaScript API

## 📂 Files

- `script.js`: The full Earth Engine script for clustering
- `map_l8_clustered_landcover_2017_southafrica.png`: Output visualization (15-class landcover clusters)
- `composite_info.md`: Description and context

## 🌍 Use Cases

- Pre-survey landcover screening
- Change detection without training data
- Unlabeled region classification for PoC, education, or disaster assessment

## 🔗 Related Article (Qiita, Japanese)

[Google Earth Engine（GEE）を使って衛星画像×機械学習で土地被覆分類](https://qiita.com/akkTYO/items/b6c9614c797003336b2c)

---

**Filename Convention**:  
`map_l8_clustered_landcover_2017_southafrica.png`  
→ `[type]_[sensor]_[processing]_[year|region]`
