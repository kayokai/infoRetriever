# 使い方
### ダウンロード
```
$ git clone https://github.com/shunnosuke-chinen/infoRetriever.git
```

### 依存ライブラリのインストール
```
$ npm install axios cheerio
```
### 実行
```js
$ cd infoRetriever
$ node ./infoRetriever.js
```

# ファイル構成
```
.
├── README.md
├── infoRetriever.js         ->  本体ファイル
└── ElementNamesForParse.js  ->  日本語と英語キーの対応関係定義テーブル
```

# 出力例
```
{
  building_name: 'ルミレイス豊洲',
  total_rent: '11.9万円',
  common_service_fee: '10000円',
  security_deposit: '11.9万円',
  key_money: '23.8万円',
  deposit: '-',
  shikibiki: '-',
  address: '東京都江東区豊洲５',
  station1_id: '東京メトロ有楽町線/豊洲駅',
  station1_distance: '歩2分',
  station2_id: '新交通ゆりかもめ/新豊洲駅',
  station2_distance: '歩14分',
  station3_id: 'りんかい線/東雲駅',
  station3_distance: '歩23分',
  layout: '1K',
  occupied_area: '25.74m2',
  age: '築8年',
  floor: '10階',
  facing: '北東',
  building_type: 'マンション',
  lighting_surface: '無',
  bicycle_parking: '有',
  separate: '有',
  bathroom_dryer: '有',
  indoor_laundry_storage: '有',
  gas_range: '有',
  two_or_more_burners: '有',
  city_gas: '有',
  air_conditioner: '有',
  auto_lock: '有',
  elevator: '有',
  mail_box: '有',
  balcony: '有',
  custom_kitchen: '有',
  closet: '有',
  shoes_box: '有',
  available: '無',
  need_guarantor: '無',
  tow_train_lines: '無',
  cs: '無',
  dedicated_internet_line: '無',
  front_desk_service: '有',
  fire_proof: '無',
  curtain: '無',
  two_stations: '無',
  three_or_more_stations: '無',
  within_five_minite_from_station: '無',
  within_ten_minite_from_station: '無',
  high_floor: '無',
  daytime_management: '有',
  bs: '無',
  gurantor_company: '無',
  detailed_layout: '洋7.1 K2.5',
  structure: '鉄筋コン',
  building_height: '10階/17階建',
  created_at: '2016年1月',
  property_insurance: '2万円2年',
  parking: '近隣100m50000円',
  move_in_date: "'23年11月下旬",
  transaction_mode: '仲介',
  conditions: '-',
  property_id: '59214156',
  SUUMO_property_id: '100352681026',
  total_units: '-',
  publication_date: '2023/11/24',
  next_update_date: '次回更新日は情報更新日より８日以内',
  fixed_term: '普通借家 2年',
  insurance_company: '保証会社利用必 初回保証委託料50％(2年目以降9600円/年) レジデントアシスタンス',
  other_costs: '合計2.2万円（内訳：鍵交換代2.2万円）',
  other_expenses: '更新料　新賃料1.00ヶ月分　室内清掃費用　41800円　口座振替事務手数料　月額110円',
  remarks: '通勤管理'
}
```