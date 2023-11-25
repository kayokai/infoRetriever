// 参考
// https://www.tohoho-web.com/js/jquery/index.htm#selector


const axios = require('axios');
const cheerio = require('cheerio');
const util = require('util');

const url = 'https://suumo.jp/chintai/jnc_000086387922/';

// 日本語カラム -> キー の変換テーブル読み込み
const { JA_TO_ENG, FEATURES_AND_FACILITIES } = require('./tables.js');

axios.get(url)
    .then(response => {
        const $ = cheerio.load(response.data);

        let result = {};
        let name = {};
        let basicInfo = {};
        let landingTable = {};
        let featuresAndFacilities = {};
        let propertyDescription = {};

        // 各要素からデータ取得
        name = { [JA_TO_ENG['物件名']]: $('h1').text() };
        basicInfo = propertyViewNoteToDict($);
        landingTable = headerAndDataToDict($, '.property_view_table  th');
        featuresAndFacilities = featuresExtractor($, '#bkdt-option  li');
        propertyDescription = headerAndDataToDict($, '.data_table  th');

        // 結果の結合
        result = { ...name, ...basicInfo, ...landingTable, ...featuresAndFacilities, ...propertyDescription }

        console.log(util.inspect(result, { showHidden: false, depth: null }));
    })

    .catch(error => {
        console.error('an error occured while getting the html with axios:', error);
    });

function featuresExtractor($, selector) {
    // すべての特徴・設備候補を'無'で初期化
    let contents_ja = {};
    for (const key of Object.keys(FEATURES_AND_FACILITIES)) {
        contents_ja[key] = '無';
    }

    // 特徴・設備を'有'に変更
    let featuresAll = $(selector).text().split('、');
    for (const feature of featuresAll) {
        contents_ja[feature] = '有';
    }

    // 英語へ変換
    let contents_en = {};
    for (const key of Object.keys(contents_ja)) {
        if (FEATURES_AND_FACILITIES[key] == undefined) continue; // HACK
        contents_en[FEATURES_AND_FACILITIES[key]] = contents_ja[key];
    }
    return contents_en;
}


function headerAndDataToDict($, selector) {
    let contents = {};
    $(selector).each(
        function (index, row) {
            // th elementを取得
            let header = $(row).text();

            // row == th elementの次要素$(row).next()であるtd elementを取得
            let data = $($(row).next()).text();

            // 整形
            let shaped_header = header.replace(/[\n\t]/g, '');
            let shaped_data = data.replace(/[\n\t]/g, '');

            // 駅徒歩カラムはカラムを3分割
            if (shaped_header == '駅徒歩') {
                stationAndDistances = shaped_data.split(/(?<=分)/g); // @HACK:

                for (let i = 0; i < 3; i++) {
                    [station, distance] = stationAndDistances[i].split(' ');

                    header = '最寄り駅_' + (i + 1);
                    let eng_header = JA_TO_ENG[header];
                    contents[eng_header] = station;

                    header = '最寄り駅_距離_' + (i + 1);
                    eng_header = JA_TO_ENG[header];
                    contents[eng_header] = distance;
                }
            } else {
                if (JA_TO_ENG[shaped_header] == undefined) throw new Error();
                let eng_header = JA_TO_ENG[shaped_header];

                contents[eng_header] = shaped_data;
            }
        }
    );
    return contents;
}

function propertyViewNoteToDict($) {
    let contents = {};
    $('.property_view_note-info span').each(
        function (index, span) {
            // th elementを取得
            let content = $(span).text();

            // 整形
            let shaped_content = content.replace(/\s+/g, '');

            // 辞書への変形
            if (shaped_content.match(/:/)) {  // ':'でheaderとdataに分割する
                var keyValue = shaped_content.split(':');
            } else { // 家賃のラベルはないのでつける
                var keyValue = ['家賃', shaped_content];
            }

            // 英語キーへ変換
            if (JA_TO_ENG[keyValue[0]] == undefined) throw new Error();
            keyValue[0] = JA_TO_ENG[keyValue[0]];

            contents[keyValue[0]] = keyValue[1];
        }
    );
    return contents;
}