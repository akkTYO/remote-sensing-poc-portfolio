// Step 1: Define the region of interest (ROI)
var region = ee.Geometry.Rectangle(31.56, -26.24, 31.78, -26.09);
Map.addLayer(region, {}, "region");
Map.centerObject(region, 10);

// Step 2: Load Landsat 8 SR imagery
var image = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
  .filterDate("2017-01-01", "2017-12-31")
  .filterBounds(region)
  .sort("CLOUD_COVER")
  .first();

// Step 3: Visualize the natural color image
var visParams = {
  bands: ["SR_B4", "SR_B3", "SR_B2"],
  min: 0,
  max: 3000,
  gamma: 1.4
};
Map.addLayer(image.clip(region), visParams, "Landsat RGB");

// Step 4: Select bands for clustering (reflectance only)
var bands = ['SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6', 'SR_B7'];
var imageForClustering = image.select(bands);

var training = imageForClustering.sample({
  region: region,
  scale: 30,
  numPixels: 5000
});

// Step 5: Instantiate the clusterer and train it
var clusterer = ee.Clusterer.wekaKMeans(15).train(training);
var result = imageForClustering.cluster(clusterer);

// Step 6: Visualize the clusters
Map.addLayer(result.clip(region).randomVisualizer(), {}, "clusters");
