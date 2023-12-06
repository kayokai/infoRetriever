/* webページのカラムをキーに変換するためのテーブル */

// 既存のカラム
// key -> string
const TABLE_JA_TO_ENG = {
    '取り扱い店舗物件コード': 'property_id', // ***
    '建物種別': 'building_type',
    '所在地': 'address', // ***
    // town_id // 
    '最寄り駅_1': 'station1_id',  // ***
    '最寄り駅_距離_1': 'station1_distance',
    '最寄り駅_2': 'station2_id',
    '最寄り駅_距離_2': 'station2_distance',
    '最寄り駅_3': 'station3_id',
    '最寄り駅_距離_3': 'station3_distance',
    '間取り': 'layout',
    '築年数': 'age',
    '構造': 'structure', //
    '階': 'floor',
    '専有面積': 'occupied_area',
    // rent //
    // administration
    '管理費・共益費': 'common_service_fee',
    '賃料': 'total_rent',
    '礼金': 'key_money',
    '敷金': 'security_deposit',
    '敷引・償却': 'shikibiki',
    '保証金': 'deposit',
    '仲介手数料': 'brokerageFee',
    // pubdate
    '契約期間': 'fixed_term',
    '駐車場': 'parking',
    '築年月': 'created_at',
    '情報更新日': 'updated_at',
    '物件名': 'building_name',
    // room_number
    // current_state
    '入居': 'move_in_date',
    // japanese_room
    '階建': 'building_height',
    // departure_date
    '情報更新日': 'publication_date' //
};

// 追加のカラム
const TABLE_NON_EXISTED = {
    '向き': 'facing',
    '備考': 'remarks',
    'ほか諸費用': 'other_expenses',
    'ほか初期費用': 'other_costs',
    '保証会社': 'insurance_company',
    '次回更新日': 'next_update_date',
    '総戸数': 'total_units',
    'SUUMO物件コード': 'SUUMO_property_id',
    '条件': 'conditions',
    '取引態様': 'transaction_mode',
    '損保': 'property_insurance',
    '間取り詳細': 'detailed_layout',
    '周辺情報': 'local_infomation'
};

// 部屋の特徴・設備の部分のテーブル
// key -> ('有', '無')
const TABLE_FEATURES_AND_FACILITIES = {
    '照明付': 'lighting_surface',
    // parking_two_cars
    '駐輪場': 'bicycle_parking',
    // motor_bike_parking,
    'バストイレ別': 'separate',
    // reheating
    '浴室乾燥機': 'bathroom_dryer',
    // washlet
    // washstand
    '室内洗濯置': 'indoor_laundry_storage',
    'ガスコンロ対応': 'gas_range',
    '2口コンロ': 'two_or_more_burners',
    '都市ガス': 'city_gas',
    'エアコン': 'air_conditioner',
    'オートロック': 'auto_lock',
    // video_intercom
    // always_garbage_outable
    'エレベーター': 'elevator',
    '宅配ボックス': 'mail_box',
    // corner_room
    'バルコニー': 'balcony',
    // designer
    // wood_flooring
    // pet_friendly
    // two_people_allowed
    // office_use_allowed
    // reform
    // renovation
    // furnished
    // consumer_electronics
    // damping_structure
    // base_isolated_system
    // musical_instruments_allowed
    // women_only
    // elderly_allowed
    // free_rent
    // garden
    // loft
    // security_camera
    // ih
    // counter_kitchen
    'システムキッチン': 'custom_kitchen',
};

const TABLE_NON_EXISTED_FEATURES = {
    'クロゼット': 'closet',
    'シューズボックス': 'shoes_box',
    '即入居可': 'available',
    '保証人不要': 'need_guarantor',
    '2沿線利用可': 'tow_train_lines',
    'CS': 'cs',
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
    '保証会社利用可': 'gurantor_company',
};

// 既存テーブルと追加テーブルをconcat
const JA_TO_ENG = { ...TABLE_JA_TO_ENG, ...TABLE_NON_EXISTED };
const JA_TO_ENG_FEATURES_AND_FACILITIES = { ...TABLE_FEATURES_AND_FACILITIES, ...TABLE_NON_EXISTED_FEATURES };

exports.JA_TO_ENG = JA_TO_ENG
exports.JA_TO_ENG_FEATURES_AND_FACILITIES = JA_TO_ENG_FEATURES_AND_FACILITIES