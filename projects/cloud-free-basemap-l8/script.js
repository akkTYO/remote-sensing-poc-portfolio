// script.js - GEE cloud-free RGB composite using Landsat 8
// Author: your_name
// Date: 2025-06
// Description: Composite generation using QA_PIXEL masking

// 1. エチオピアの国境ポリゴンを取得
var ethiopia = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017')
                   .filter(ee.Filter.eq('country_na', 'Ethiopia'));
                   
// 2. Landsat 8 Collection 2, Level-2 SR 画像（2017年）を取得
var l8 = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
            .filterDate('2017-01-01', '2017-12-31')
            .filterBounds(ethiopia);

// 3. 雲マスクと合成処理
// 3-1. 反射率への変換（SRスケーリング）
function prepSR(img) {
  var sr = img.select('SR_B.*')               // B1〜B7の反射率バンドをまとめて取得
              .multiply(2.75e-05)             // スケール係数で割り戻し
              .add(-0.2)                      // オフセット補正
              .clamp(0, 1);                   // 反射率を0〜1の範囲に制限
// 3-2. 雲マスク処理
  var qa = img.select('QA_PIXEL');  // 各ピクセルの状態を示すQAバンドを取得

  var mask = qa.bitwiseAnd(1 << 3).eq(0)  // Bit 3 = 雲影 → 0（雲影なし）
               .and(qa.bitwiseAnd(1 << 4).eq(0)); // Bit 4 = 雲 → 0（雲なし）

  return sr.updateMask(mask)
           .copyProperties(img, ['system:time_start']);
}
// 3-3. 雲除去済み画像の中央値コンポジット
var composite = l8.map(prepSR)
                  .select(['SR_B4', 'SR_B3', 'SR_B2'])  // R, G, Bの自然色バンド
                  .median()　       //中央値で合成
                  .clip(ethiopia);  //国境ポリゴンでトリミング
                  
// 4. 表示と出力
// 4-1. 画面表示（自然色）
Map.centerObject(ethiopia, 6);  // エチオピアを中心にズーム
Map.addLayer(composite,         // 表示する画像（R,G,B合成）
             {min: 0.05, max: 0.4},
             'Ethiopia L8 2017');
// 4-2. GeoTIFF出力
Export.image.toDrive({
  image: composite.unmask(0),   // 書き出す画像
  description: 'Ethiopia_L8_2017_SR',  // ファイル名（拡張子は自動）
  region: ethiopia.geometry(),         // 出力範囲（国境ポリゴンでクリップ）
  scale: 30,                     // 解像度（30m/pixel）
  maxPixels: 1e13       　　　　   // 上限ピクセル数（大きな国土でも対応）
});
