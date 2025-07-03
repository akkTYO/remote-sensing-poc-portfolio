// Calculate NDVI, EVI, and MNDWI from Landsat 8 imagery over Kenya

// 1. Define ROI
var roi = ee.FeatureCollection("USDOS/LSIB_SIMPLE/2017")
             .filter(ee.Filter.eq("country_na", "Kenya"));

// 2. Cloud mask function
  //Bit 0 - FIll
  //Bit 1 - Dilated Cloud
  //Bit 2 - Cirrus 
  //Bit 3 - Cloud
  //Bit 4 - Cloud Shadow
function cloudmask(image){
  var qaMask = image.select("QA_PIXEL").bitwiseAnd(parseInt("11111", 2)).eq(0);
  var saturationMask = image.select("QA_RADSAT").eq(0);
  return image.updateMask(qaMask).updateMask(saturationMask);
}

// 3. Scale surface reflectance and thermal bands
function applyScaleFactors(image){
  var opticalBands = image.select("SR_B.").multiply(0.0000275).add(-0.2);
  var thermalBands = image.select("ST_B.*").multiply(0.00341802).add(149.0);
  return image.addBands(opticalBands, null, true)
              .addBands(thermalBands, null, true);
}

// 4. Load Landsat 8 image collection for 2021
var dataset = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
  .filter(ee.Filter.date("2021-01-01", "2022-01-01"))
  .filter(ee.Filter.bounds(roi))
  .map(applyScaleFactors)
  .map(cloudmask);

// 5. Create median composite
var image = dataset.median();

// 6. Visualization
var rgbVis = {min: 0, max: 0.3, bands: ["SR_B4", "SR_B3", "SR_B2"]};
Map.centerObject(roi, 6);
Map.addLayer(image.clip(roi), rgbVis, "Landsat 8 Image");

// 7. Create NDVI image
var ndvi = image.normalizedDifference(["SR_B5", "SR_B4"]).rename("ndvi");

// 8. Create MNDWI image
var mndwi = image.normalizedDifference(["SR_B3", "SR_B6"]).rename("mndwi");

// 9. Create EVI image
// EVI = 2.5 * ((Band 5 - Band 4) / (Band 5 + Band 4 - 7.5 * Band 2 + 1 )).
var evi = image.expression(
  "2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))",
  {
    "BLUE": image.select("SR_B2"),
    "RED": image.select("SR_B4"),
    "NIR": image.select("SR_B5")
  }
).rename("evi");

// 10. Visualization styles
var ndviVis = {min: 0, max: 0.5, palette: ["white", "green"]};
var ndwiVis = {min: 0, max: 0.5, palette: ["white", "blue"]};

// 11. Display
Map.addLayer(ndvi.clip(roi), ndviVis, "NDVI");
Map.addLayer(evi.clip(roi), ndviVis, "EVI");
Map.addLayer(mndwi.clip(roi), ndwiVis, "MNDWI");
