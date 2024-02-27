const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const util = require('util');
const { JA_TO_ENG, JA_TO_ENG_FEATURES_AND_FACILITIES } = require('./ElementNamesForParse.js'); // 日本語カラム -> キー の変換テーブル読み込み    

const SELECTORS_CANARY = { '物件名': '.sc-2b6ccadd-0 > div', '基本情報': '.sc-2a5f97b2-6 .sc-b0a261e8-0', '設備・特徴': '.sc-2a5f97b2-8 .sc-1f5690b8-2', '物件概要': '.sc-2a5f97b2-11 .sc-1f5690b8-1'};
const DOES_USE_NEXT_CLASS_CANARY = { '物件名': false, '基本情報': true, '設備・特徴': false, '物件概要': true};


/* 簡易テスト */
async function main() {
    let list_keys_set = []
    const list_test_url = ['https://web.canary-app.jp/chintai/rooms/8b0f169e-d45e-4aa7-ac27-3349f3d844f1/'];


    for (test_url of list_test_url) {
        const result = await parseCANARY(test_url);
        list_keys_set.push(new Set(Object.keys(result)));
        console.log(util.inspect(result, { showHidden: false, depth: null }));
    }
    //await browser.close();
}

if (require.main == module) {
    main();
}

/**
 * メインのロジック関数
 * @param {*} browser
 * @param {*} url 
 * @returns 
 */
async function parseCANARY(url) {
    try {
        const browser = await puppeteer.launch({headless: 'new'});
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        const content = await page.content();
        const $ = cheerio.load(content);

        // 掲載物件名取得
        let propertyName = getPropertyName($);

        // 基本情報取得
        let basicInfo = getBasicInfo($);

        // 設備・特徴取得
        let featuresAndFacilities = getFeaturesAndFacilities($);

        // 物件概要取得
        let propertyDescription = getPropertyDescription($);

        // 結果の結合    
        let result = {...propertyName, ...basicInfo, ...featuresAndFacilities, ...propertyDescription};
        
        // puppeteerで開いたブラウザを閉じる
        await browser.close();

        // 結果を返す    
        return result;
    } catch (error) {
        console.error('An error occured while getting the html file with puppeteer:', error);
        throw error;
    }
}


/**
 * 掲載物件名を辞書形式で取得
 * @param {*} $ 
 * @returns
 */
function getPropertyName($) {
    let dictPropertyName = {};
    let selector = SELECTORS_CANARY['物件名'];
    let buildingName = $(selector).text().replace('の賃貸物件情報', '');
    dictPropertyName[JA_TO_ENG['掲載物件名']] = buildingName;
    dictPropertyName[JA_TO_ENG['物件名']] = buildingName.replace(/\（.*駅\）/, '');
    
    return dictPropertyName;
}

/**
 * 基本情報を辞書形式で取得
    * 賃料
    * 管理費等
    * 敷金
    * 礼金
    * 間取り
    * 面積
    * 築年月
    * 種目
    * 階建/階
    * 主要採光面
    * 住所
    * 交通
 * @param {*} $ 
 * @returns dict
 */
function getBasicInfo($) {
    return { ...getTitleAndData($, '基本情報') }
}

/**
 * 部屋の各特徴・設備について，あるなら1，ないなら0になる辞書を取得
 * @param {*} $
 * @returns dict
 */
function getFeaturesAndFacilities($) {
    // すべての特徴・設備を'0'で初期化  
    let dictFeaturesAndFacilities = {};

    for (const feature of Object.values(JA_TO_ENG_FEATURES_AND_FACILITIES)) {
        dictFeaturesAndFacilities[feature] = 0;
    }
    
    let features = [];

    $(SELECTORS_CANARY['設備・特徴']).each(
        function(index, row) {
            if ($(row).text() != '-') {
                let features = $(row).text().split('、');
                for (const feature_ja of features) {
                    if (JA_TO_ENG_FEATURES_AND_FACILITIES[feature_ja] == undefined) {
                        JA_TO_ENG_FEATURES_AND_FACILITIES[feature_ja] = 'ヘッダーなし' + feature_ja;
                    }
                    dictFeaturesAndFacilities[JA_TO_ENG_FEATURES_AND_FACILITIES[feature_ja]] = 1;
                }
            }
        }
    )
    
    return dictFeaturesAndFacilities;
}

/**
 * 物件概要を辞書形式で取得
 * @param {*} $ 
 * @returns dict 
 */
function getPropertyDescription($) {
    return getTitleAndData($, '物件概要');
}


/**
 * contentに関するtitleとdateを取得
 * @param {*} $ 
 * @param {*} content 取得情報の概要（日本語）
 * @returns dict 
 */
function getTitleAndData($, content) {   
    let dictTitleAndData = {};

    if (DOES_USE_NEXT_CLASS_CANARY[content]){
        dictTitleAndData = { ...extractWithNextElement($, SELECTORS_CANARY[content]), ...dictTitleAndData}
    } else {
        dictTitleAndData = { ...getTitleAndDataDevidedByColumn($, SELECTORS_CANARY[content]), dictTitleAndData}
    }

    return dictTitleAndData
}

/**
 * titleをselectorに従って取得し，dataをselectorの次の要素next()として取得
 * @param {*} $ 
 * @param {*} selector 
 * @returns dict 
 */
function extractWithNextElement($, selector) {
    let contents = {};
    $(selector).each(
        function (index, row) {
            // th element　を取得
            let title = $(row).text();

            // th element の次要素 td element を取得
            let data = $($(row).next()).text();

            //整形
            let shaped_title = title.replace(/\s/g, '');
            let shaped_data = data.replace(/\s/g, '');

            if (shaped_title == '賃料') {
                if (shaped_data.split('/')[1]) {
                    contents[JA_TO_ENG['賃料']] = shaped_data.split('/')[0];
                    contents[JA_TO_ENG['管理費・共益費']] = shaped_data.split('/')[1];
                }
            }
            else if (shaped_title == '敷/礼') {
                contents[JA_TO_ENG['敷金']] = shaped_data.split('/')[0];
                contents[JA_TO_ENG['礼金']] = shaped_data.split('/')[1];
            }
            else if (shaped_title == '階数') {
                contents[JA_TO_ENG['階']] = shaped_data.split('/')[0];
                contents[JA_TO_ENG['階建']] = shaped_data.split('/')[1];
            }
            else if (shaped_title == '建物') {
                contents[JA_TO_ENG['建物種別']] = shaped_data.split('/')[0];
                contents[JA_TO_ENG['構造']] = shaped_data.split('/')[1];
            }
            else if (shaped_title == '交通') {
                let station_selctor = '.sc-2a5f97b2-6 .sc-31af148c-2';
                $(station_selctor).each(
                    function(index, row) {
                        let station = $(row).text();
                        let distance = $($(row).next()).text();
                        let eng_title_st = JA_TO_ENG['最寄り駅_' + (index + 1)];
                        contents[eng_title_st] = station;

                        let eng_title_d = JA_TO_ENG['最寄り駅_距離_' + (index + 1)];
                        contents[eng_title_d] = distance;
                    }
                );
            }
            else if (shaped_title == '情報') {
                let info_selector = '.sc-2a5f97b2-11 .sc-1f5690b8-2 p';
                $(info_selector).each(
                    function(index, row) {
                        title = $(row).text().split('：')[0];
                        data = $(row).text().split('：')[1];
                        let eng_title = JA_TO_ENG[title];
                        contents[eng_title] = data;
                    }
                );
            }
            else {
                if (JA_TO_ENG[shaped_title] == undefined) JA_TO_ENG[shaped_title] = "ヘッダーなし" + shaped_title;
                let eng_title = JA_TO_ENG[shaped_title];

                contents[eng_title] = shaped_data;
            }
        }
    );
    return contents;
}

/**
 * titleとdataが別クラスに分けられていないとき，':'でtitleとdataに分ける(e.g. '敷金: 11.9万円')
 * 賃料に関してはad hockにtitleをつける
 * @param {*} $ 
 * @returns dict
 */
/*今回この関数は使用していない
function getTitleAndDataDevidedByColumn($, selector) {
    let contents = {};
    $(selector).each(
        function (index, span) {
            // th elementを取得    
            let content = $(span).text();

            // 整形   
            let shaped_content = content.replace(/\s+/g, '');

            // 辞書への変形   
            let keyValue;
            if (shaped_content.includes(':')) {  // ':'でtitleとdataに分割する   
                keyValue = shaped_content.split(':');
            } else if (shaped_content.includes('円')) { // 家賃のラベルはないのでつける  
                keyValue = ['賃料', shaped_content];
            }

            // 英語キーへ変換  
            if (JA_TO_ENG[keyValue[0]] == undefined) throw new Error();
            keyValue[0] = JA_TO_ENG[keyValue[0]];

            contents[keyValue[0]] = keyValue[1];
        }
    );
    return contents;
}
*/

module.exports = {
    parseCANARY,
};