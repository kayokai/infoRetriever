/* webページのカラムをキーに変換するためのテーブル */

// 既存のカラム
// key -> string
const TABLE_JA_TO_ENG = {
    '取り扱い店舗物件コード': 'property_id', // ***
    '建物種別': 'building_type',
    '種目': 'building_type', //athome
    '物件種目' :'building_type', //athome
    '所在地': 'address', // ***
    '住所': 'address', //athome
    // town_id // 
    '最寄り駅_1': 'station1',  // ***
    '最寄り駅_距離_1': 'station1_distance',
    '最寄り駅_2': 'station2',
    '最寄り駅_距離_2': 'station2_distance',
    '最寄り駅_3': 'station3',
    '最寄り駅_距離_3': 'station3_distance',
    '間取り': 'layout',
    '築年数': 'age', //canary
    '構造': 'structure', //
    '建物構造': 'structure',
    '建物構造・工法': 'structure', //athome
    '階': 'floor',
    '専有面積': 'occupied_area',
    '面積': 'occupied_area', //athome
    '広さ': 'occupied_area', //canary
    // rent //
    '管理': 'administration',
    '管理費・共益費': 'common_service_fee',
    '管理費等': 'common_service_fee',
    '賃料': 'total_rent',
    '礼金': 'key_money',
    '敷金': 'security_deposit',
    '敷引・償却': 'shikibiki',
    '保証金': 'deposit',
    '仲介手数料': 'brokerageFee',
    '情報登録日': 'pubdate',
    '契約期間': 'fixed_term',
    '駐車場': 'parking',
    '築年月': 'age',
    '情報更新日': 'updated_at',
    '物件名': 'building_name',
    '部屋番号': 'room_number',
    '現況': 'current_state',
    '入居': 'move_in_date',
    '入居可能時期': 'move_in_date',
    '入居時期': 'move_in_date', //canary
    // japanese_room
    '階建': 'building_height',
    // departure_date
    //'情報更新日': 'publication_date', //update_atと被ってる
    '情報公開日': 'pubdate', //athome
    '掲載物件名': 'published_building_name',
  };
  
  // 追加のカラム
  const TABLE_NON_EXISTED = {
    '向き': 'facing',
    '主要採光面': 'facing',
    '備考': 'remarks',
    '物件備考': 'remarks', //canary
    'ほか諸費用': 'other_expenses',
    'ほか初期費用': 'other_costs',
    'その他費用': 'other_costs',
    'その他一時金': 'other_costs', //athome
    '保証会社': 'insurance_company',
    '次回更新日': 'next_update_date',
    '次回更新予定日': 'next_update_date',
    '総戸数': 'total_units',
    'SUUMO物件コード': 'SUUMO_property_id',
    '条件': 'conditions',
    '条件等': 'conditions', //athome
    '取引態様': 'transaction_mode',
    '損保': 'property_insurance',
    '保険等': 'property_insurance', //athome
    '住宅保険': 'property_insurance',
    '間取り詳細': 'detailed_layout',
    '周辺情報': 'local_infomation',
    'バルコニー面積': 'balcony_area',
    '契約形態': 'contract_type',
    '更新料': 'renewal_fee',
    "LIFULLHOME'S物件番号": 'HOMES_property_id',
    '会社名': 'company',
    '自社管理番号': 'company_control_id',
    '掲載会社 管理番号': 'company_control_id', //athome
    '維持費等': 'maintenace_costs', //athome
    'クレジットカード決済': 'credit_card_payment', //athome
    '駐輪場': 'bicycle_parking', //athome
    '鍵タイプ': 'key_type', //athome
    'ペット': 'pet', //athome
    '物件番号': 'ATHOME_property_id', //athome
    '保証人代行': 'guarantor_acting', //canary
  };
  
  // 部屋の特徴・設備の部分のテーブル
  // key -> ('有', '無')
  const TABLE_FEATURES_AND_FACILITIES = {
    '照明付': 'lighting_surface',
    '照明器具付き': 'lighting_surface',
    '照明器具': 'lighting_surface', //athome
    // parking_two_cars
    '駐輪場': 'bicycle_parking',
    '駐輪場あり': 'bicycle_parking',
    // motor_bike_parking,
    'バイク置き場': 'motor_bike_parking', //canary
    'バストイレ別': 'separate',
    'バス・トイレ別': 'separate',
    '追焚機能': 'reheating',
    '追焚機能浴室': 'reheating', //canary
    '浴室乾燥機': 'bathroom_dryer',
    '温水洗浄便座': 'washlet',
    '洗面所独立': 'washstand',
    '洗面台': 'washstand', //athome
    '洗面化粧台': 'washstand', //canary
    '室内洗濯置': 'indoor_laundry_storage',
    '室内洗濯機置場': 'indoor_laundry_storage',
    'ガスコンロ対応': 'gas_range', //ガスレンジとガスコンロは違う？
    'ガスコンロ設置済': 'gas_range',
    'ガスコンロ付': 'gas_range', //athome
    'ガスコンロ可': 'gas_range', //athome ガスコンロ付との違いが分からない
    'ガスレンジ': 'gas_range', //canary
    '2口コンロ': 'two_or_more_burners',
    'コンロ二口': 'two_or_more_burners',
    'コンロ三口': 'two_or_more_burners',
    '２口コンロ': 'two_or_more_burners', //athome
    '３口以上コンロ': 'two_or_more_burners', //athome
    '3口以上コンロ': 'two_or_more_burners', //canary
    '都市ガス': 'city_gas',
    'エアコン': 'air_conditioner',
    'オートロック': 'auto_lock',
    'TVモニタ付インターホン': 'video_intercom',
    'モニター付インターホン': 'video_intercom',
    // always_garbage_outable
    '24時間ゴミ出し可': 'always_garbage_outable', //canary
    'エレベーター': 'elevator',
    '宅配ボックス': 'mail_box', //間違い？
    '角部屋': 'corner_room',
    '角住戸': 'corner_room', //canary
    'バルコニー': 'balcony',
    // designer
    'デザイナーズ': 'designer', //canary
    'フローリング': 'wood_flooring',
    'ペット可': 'pet_friendly',
    '二人入居可': 'two_people_allowed',
    // office_use_allowed
    '事務所可': 'office_use_allowed', //canary
    'リフォーム物件': 'reform',
    'リフォーム済み': 'reform', //canary
    // renovation
    'リノベーション': 'renovation', //canary
    // furnished
    '家具付': 'furnished', //canary
    // consumer_electronics
    // damping_structure
    // base_isolated_system
    // musical_instruments_allowed
    // women_only
    '女性限定': 'women_only', //canary
    // elderly_allowed
    'フリーレント': 'free_rent',
    // garden
    '専用庭': 'garden', //canary
    'ロフト付き': 'loft',
    'ロフト': 'loft', //canary
    '防犯カメラ': 'security_camera',
    'IHコンロ': 'ih',
    'IHクッキングヒーター': 'ih', //canary
    'カウンターキッチン': 'counter_kitchen',
    'システムキッチン': 'custom_kitchen',
  };
  
  const TABLE_NON_EXISTED_FEATURES = {
    'クロゼット': 'closet',
    'クローゼット': 'closet',
    '押入': 'closet', //canary
    'シューズボックス': 'shoes_box',
    '即入居可': 'available',
    '保証人不要': 'needless_guarantor',
    '保証人要': 'need_guarantor',
    '2沿線利用可': 'tow_train_lines',
    'CS': 'cs',
    'CS対応': 'cs',
    'ＣＳ': 'cs', //athome
    'ネット専用回線': 'dedicated_internet_line',
    'フロントサービス': 'front_desk_service',
    '耐火構造': 'fire_proof',
    'カーテン付': 'curtain',
    '2駅利用可': 'two_stations',
    '3駅以上利用可': 'three_or_more_stations',
    '駅徒歩5分以内': 'within_five_minite_from_station',
    '駅徒歩10分以内': 'within_ten_minite_from_station',
    '高層階': 'high_floor',
    '日勤管理': 'daytime_management',
    'BS': 'bs',
    'BS対応': 'bs',
    'ＢＳ端子': 'bs', //athome
    '保証会社利用可': 'gurantor_company',
    '給湯': 'hot_water',
    '専用バス': 'private_bath',
    '専用トイレ': 'private_toilet',
    'シャワー': 'shower',
    '光ファイバー': 'optical_fiber',
    '公営水道': 'public_water_supply',
    '下水': 'drainage',
    'インターネット使用料無料': 'free_internet',
    'ネット使用料不要': 'free_internet', //canary
    'CATV': 'catv',
    'ケーブルTV': 'catv', //athome
    '出窓': 'bay_window',
    '南面バルコニー': 'south_balcony',
    '浄水器・活水器': 'water_purifier',
    '浄水器': 'water_purifier',
    '駐車場あり': 'car_parking',
    '全室フローリング': 'all_flooring',
    '全居室フローリング': 'all_flooring', //athome
    'タイル貼り': 'tiling',
    'ディンプルキー': 'dimple_key',
    'シャワー付洗面化粧台': 'washstand_with_shower',
    'シャワー付洗面台': 'washstand_with_shower', //canary
    '複層ガラス・複層サッシ': 'double_glazing',
    'セキュリティ会社加入済': 'security',
    '防犯（雨戸）シャッター': 'shutter',
    'シャッター雨戸': 'shutter', //athome
    'インターネット対応': 'internet',
    '室内洗濯物干し': 'indoor_drying',
    '洗濯機置き場あり': 'laundry_space',
    '洗濯機置場': 'laundry_space', //canary
    'ルーフバルコニー': 'roof_balcony',
    'TVインターホン': 'TV_intercom',
    'トイレ': 'toilet', //athome
    '収納スペース': 'strage_space', //athome
    '宅配ＢＯＸ': 'delivery_box', //athome
    'プロパンガス': 'LP_gas', //athome
    'ダブルロックドア': 'double_lock', //athome
    'ダブルロックキー': 'double_lock', //canary
    '二階以上': 'second_floor_or_above', //canary
    '敷地内ごみ置き場': 'onsite_garbage_storage', //canary
    '都市ガス給湯': 'city_gas_hot_water', //athome
    'クッションフロア': 'cushion_floor', //athome
    'CATVインターネット': 'catv_internet', //athome
    'バス・トイレ同室': 'unit_bath', //athome
    'モニター付オートロック': 'auto_lock_with_monitor', //athome
    '冷蔵庫': 'refrigerator', //athome
    '冷蔵庫付': 'refrigerator', //canary
    '全居室収納': 'all_rooms_strage', //canary
    '敷金不要': 'no_security_deposit', //canary
    '礼金不要': 'no_key_money', //canary
    '1口コンロ': 'one_burner', //canary
    '二面採光': 'dual_lighting', //canary
    'インターホン': 'intercom', //canary
    '2×4工法': '2by4_method', //canary
    '二人入居相談': 'two_people_consultation', //canary
    '子供可': 'children_allowed', //canary
    'ペット相談': 'pet_consultation', //canary
    '脱衣所': 'dressing_room', //canary
    'グリル付': 'grill', //canary
    '収納3ヵ所': 'three_storage', //canary
    '振分': 'furiwake', //canary
    '浴室に窓': 'window_in_bathroom', //canary
    'ウォークインクロゼット': 'walkin_closet', //canary
    '床下収納': 'underfloor_storage', //canary
    '収納1間半': '1.5_ken_storage', //canary
    '最上階': 'top_floor', //canary
    '収納2間': '2_ken_storage', //canary
    '収納2ヵ所': 'two_storage', //canary
    '分譲賃貸': 'condo', //canary
    '定期借家': 'fixed_term', //canary
    '単身者限定': 'one_person_only', //canary
    '子供不可': 'no_children', //canary
    'シャンプードレッサー': 'shampoo_dresser', //canary
    '24時間換気システム': 'always_ventilation', //canary
    '陽当り良好': 'good_sunlight', //canary
    'ウッドテラス': 'wood_terrace', //canary
    '1フロア2住戸': 'two_units_per_floor', //canary
    '収納2間半': '2.5_ken_storage', //canary
    '電気コンロ': 'electric_burner', //canary
    '火災警報器等設置済み': 'fire_alarm', //canary
    '玄関ホール': 'entrance_hall', //canary
    '屋根裏収納': 'attic_storage', //canary
    'クロゼット2ヶ所': 'two_closet', //canary
    '敷地内駐車場': 'onsite_parking', //canary
    'メゾネット': 'maisonette', //canary
    'エアコン全室': 'all_rooms_air_conditiner', //canary
    '収納1間': '1_ken_storage', //canary
    'ペアガラス': 'double_glazing', //canary
    'テラス': 'terrace', //canary
    '24時間緊急通報システム': 'always_emergency_call_system', //canary
    '外壁タイル張り': 'exterior_wall_tiling', //canary
    '事務所相談': 'office_consultation', //canary
    'オール電化': 'all_electric', //canary
    'BS・CS': 'bs_cs', //canary
    'TV付浴室': 'bathroom_tv', //canary
    '洗濯機付': 'washing_machine', //canary
    '全室東南向き': 'all_rooms_facing_south_east', //canary
    '耐震構造': 'earthquake_resistant', //canary
    '床暖房': 'floor_heating', //canary
    '全室照明付': 'all_rooms_lighting', //canary
    'クロゼット3ヶ所': 'three_closet', //canary
    '2面バルコニー': 'two_sides_balcony', //canary
    '3点給湯': 'three_point_hot_water', //canary
    'バリアフリー': 'barrier_free', //canary
    'テレビ付': 'TV', //canary
    'オートバス': 'auto_bath', //canary
    'キッチンに窓': 'window_in_kitchen', //canary
    '南面3室': 'three_south_facing_rooms', //canary
    '全室南向き': 'all_rooms_facing_south', //canary
    'ルームシェア可': 'room_share', //canary
    '食器洗乾燥機': 'dishwasher', //canary
    '収納3間': '3_ken_storage', //canary
    '楽器相談': 'musical_instrument_consultation', //canary
    '1フロア1住戸': 'one_unit_per_floor', //canary
    '電子レンジ付': 'microwave', //canary
    '楽器不可': 'no_musical_instrument', //canary
    'ペット不可': 'no_pet', //canary
    '事務所不可': 'no_office', //canary
    '家具・家電付': 'furniture_and_consumer_electronics', //canary
    '初期費用カード決済可': 'initial_fee_card_payment', //canary
    'トランクルーム': 'trunk_room', //canary
    'ルームシェア不可': 'no_room_share', //canary
    '二人入居不可': 'no_two_people' //canary
  };
  
  // 既存テーブルと追加テーブルをconcat
  const JA_TO_ENG = { ...TABLE_JA_TO_ENG, ...TABLE_NON_EXISTED };
  const JA_TO_ENG_FEATURES_AND_FACILITIES = { ...TABLE_FEATURES_AND_FACILITIES, ...TABLE_NON_EXISTED_FEATURES };
  
  exports.JA_TO_ENG = JA_TO_ENG
  exports.JA_TO_ENG_FEATURES_AND_FACILITIES = JA_TO_ENG_FEATURES_AND_FACILITIES