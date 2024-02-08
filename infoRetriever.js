// 参考   
// https://www.tohoho-web.com/js/jquery/index.htm#selector  
//console.log(util.inspect(parseHOMES(url), { showHidden: false, depth: null }));   

const puppeteer = require('puppeteer')
const cheerio = require('cheerio');
const util = require('util');
const { JA_TO_ENG, JA_TO_ENG_FEATURES_AND_FACILITIES } = require('./ElementNamesForParse.js'); // 日本語カラム -> キー の変換テーブル読み込み  
const HOMES = require('./homes.js')


/* 

- cheerioにより，selector指定してhtmlの各elementを取得する
- title: data 形式のデータで，titleとdataの記述クラスが異なるときは，titleのクラスをselectorに指定し，dataは兄弟要素としてnext()で取得する

-------------------------------------constantsの定義---------------------------------------------

SUUMO-type1: e.g. https://suumo.jp/chintai/jnc_000086387922/
    selectorの定義：SELECTORS_SUUMO_TYPE1
    table形式で定義されており，next()を使って取得するかどうか：DOES_USE_NEXT_CLASS_SUUMO_TYPE1

SUUMO-type2: e.g. https://suumo.jp/chintai/bc_100355755056/
    selectorの定義：SELECTORS_SUUMO_TYPE1
    table形式で定義されており，next()を使って取得するかどうか：DOES_USE_NEXT_CLASS_SUUMO_TYPE2

-----------------------------------------------------------------------------------（2023/12/06時点）
*/

const SELECTORS_SUUMO_TYPE1 = { '物件名': 'h1', '賃料': '.property_view_note-info span', '初期費用': '.property_view_note-info span', '部屋情報': '.property_view_table  th', 'アクセス': '.property_view_table  th', '所在地': '.property_view_table  th', '特徴・設備': '#bkdt-option  li', '物件概要': '.data_table  th' }
const DOES_USE_NEXT_CLASS_SUUMO_TYPE1 = { '物件名': false, '賃料': false, '初期費用': false, '部屋情報': true, 'アクセス': true, '所在地': true, '特徴・設備': false, '物件概要': true }

const SELECTORS_SUUMO_TYPE2 = { '物件名': 'h1', '賃料': '.property_view_main-emphasis', '初期費用': '.property_view_detail-body .property_data-title', '部屋情報': '.property_data .property_data-title', 'アクセス': '.property_view_detail--train .property_view_detail-header', '所在地': '.property_view_detail--location .property_view_detail-header', '特徴・設備': '#bkdt-option  li', '物件概要': '.data_table  th' }
const DOES_USE_NEXT_CLASS_SUUMO_TYPE2 = { '物件名': false, '賃料': false, '初期費用': true, '部屋情報': true, 'アクセス': true, '所在地': true, '特徴・設備': false, '物件概要': true }


/* 簡易テスト */
async function main() {
    let list_keys_set = []
    const list_test_url = ['https://suumo.jp/chintai/bc_100355755056/', 'https://suumo.jp/chintai/jnc_000086387922/', 'https://suumo.jp/chintai/bc_100364880038/'];

    const browser = await puppeteer.launch({ headless: "new" });

    for (test_url of list_test_url) {
        if (test_url.includes('suumo.jp')) {
            result = await parseSUUMO(browser, test_url);
        } else if (test_url.includes('homes.co.jp')) {
            result = await HOMES.parseHOMES(browser, test_url);
        } else {
            // 不明なURLが含まれている場合はエラーを投げる
            throw new Error(`Unknown URL: ${test_url}`);
        }
        list_keys_set.push(new Set(Object.keys(result)));
        console.log(util.inspect(result, { showHidden: false, depth: null }));
    }
    await browser.close();
}

if (require.main == module) {
    main();
}


/**
 * メインのロジック関数
 * @param {*} browser {*} url 
 * @returns 
 */
async function parseSUUMO(browser, url) {
    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        const content = await page.content();
        const $ = cheerio.load(content);

        // 物件名取得
        let propertyName = getPropertyName($);

        // 初期費用取得
        let rentAndInitialCosts = getRentAndInitialCosts($);

        // 部屋情報・アクセス（駅徒歩）・所在地取得
        let basicInfo = getBasicInfo($);

        // 特徴・設備取得
        let featuresAndFacilities = getFeaturesAndFacilities($)

        // 物件概要取得
        let propertyDescription = getPropertyDescription($);

        // 結果の結合    
        let result = { ...propertyName, ...rentAndInitialCosts, ...basicInfo, ...featuresAndFacilities, ...propertyDescription }

        // puppeteerで開いたページを閉じる
        await page.close();

        // 結果を返す    
        return result;
    } catch (error) {
        console.error('An error occured while getting the html file with axios:', error);
        throw error;
    }
}


/**
 * 物件名を辞書形式で取得
 * @param {*} $ 
 * @returns dict
 */
function getPropertyName($) {
    const LIST_SELECTORS_ALL = [SELECTORS_SUUMO_TYPE1, SELECTORS_SUUMO_TYPE2]
    let dictPropertyName = {};

    for (selectors_SUUMO of LIST_SELECTORS_ALL) {
        let selector = selectors_SUUMO['物件名'];
        dictPropertyName[JA_TO_ENG['物件名']] = $(selector).text().replaceAll(/\t|\n|\s|- \(株\).*|の賃貸物件情報/g, '');
    };
    return dictPropertyName;
}



/**
 * 賃料と初期費用を辞書形式で取得
    *  賃料
    *  管理費・共益費
    *  敷金
    *  礼金
    *  保証金
    *  敷引・償却
 * @param {*} $ 
 * @returns dict
 */
function getRentAndInitialCosts($) {
    return { ...getTitleAndData($, '賃料'), ...getTitleAndData($, '初期費用') }
}


/**
 * 部屋情報・アクセス（駅徒歩）・所在地を辞書形式で取得
    *  部屋情報
        *  間取り
        *  築年数
        *  向き
        *  専有面積
        *  建物種別
        * (Optional)階
    *  所在地
    *  駅徒歩（アクセス）
 * @param {*} $ 
 * @returns dict
 */
function getBasicInfo($) {
    return { ...getTitleAndData($, '部屋情報'), ...getTitleAndData($, 'アクセス'), ...getTitleAndData($, '所在地') }
}


/**
 * 部屋の各特徴・設備について，あるなら1，ないなら0になる辞書を取得
 * @NOTE SUUMO_type1もSUUMO_type2もselectorが一緒だが，変更に備えて冗長に実装してある
 * @param {*} $
 * @param {*} selector 
 * @returns dict
 */
function getFeaturesAndFacilities($) {
    // すべての初期費用候補を'0'で初期化  
    const LIST_SELECTORS_ALL = [SELECTORS_SUUMO_TYPE1, SELECTORS_SUUMO_TYPE2]
    let dictFeaturesAndFacilities = {};

    for (selectors_SUUMO_typex of LIST_SELECTORS_ALL) {
        for (const feature of Object.values(JA_TO_ENG_FEATURES_AND_FACILITIES)) {
            dictFeaturesAndFacilities[feature] = 0;
        }

        // 初期費用を'1'に変更 
        let featuresAll = $(selectors_SUUMO_typex['特徴・設備']).text().split('、'); // @HACK
        for (const feature_ja of featuresAll) {
            dictFeaturesAndFacilities[JA_TO_ENG_FEATURES_AND_FACILITIES[feature_ja]] = 1;
        }
    }
    return dictFeaturesAndFacilities;
}


/**
 * 物件概要を辞書形式で取得
 * @param {*} $ 
 * @returns 
 */
function getPropertyDescription($) {
    return getTitleAndData($, '物件概要')
}

/**
 * contentに関するtitleとdateを取得
 * @param {*} $ 
 * @param {*} content 取得情報の概要（日本語）
 * @returns dict 
 */
function getTitleAndData($, content) {
    const SUUMO_TYPE1 = { 'selectors': SELECTORS_SUUMO_TYPE1, 'does_use_next_class': DOES_USE_NEXT_CLASS_SUUMO_TYPE1 }
    const SUUMO_TYPE2 = { 'selectors': SELECTORS_SUUMO_TYPE2, 'does_use_next_class': DOES_USE_NEXT_CLASS_SUUMO_TYPE2 }
    const LIST_SUUMO_ALL_TYPES = [SUUMO_TYPE1, SUUMO_TYPE2]
    let dictTitleAndData = {};

    for (suumo_typex of LIST_SUUMO_ALL_TYPES) {
        if (suumo_typex['does_use_next_class'][content]) {
            dictTitleAndData = { ...extractWithNextElement($, suumo_typex['selectors'][content]), ...dictTitleAndData }
        } else {
            dictTitleAndData = { ...getTitleAndDataDevidedByColumn($, suumo_typex['selectors'][content]), ...dictTitleAndData }
        }
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
            // th elementを取得    
            let title = $(row).text();

            // row == th elementの次要素$(row).next()であるtd elementを取得   
            let data = $($(row).next()).text();

            // 整形   
            let shaped_title = title.replace(/[\n\t]/g, '');
            let shaped_data = data.replace(/[\n\t]/g, '');


            // 駅徒歩カラムはカラムを3分割   
            if (shaped_title == '駅徒歩' || shaped_title == 'アクセス') {
                stationAndDistances = shaped_data.split(/(?<=分)/g); // @HACK

                for (let i = 0; i < 3; i++) {
                    if (!stationAndDistances[i]) continue;
                    [station, distance] = stationAndDistances[i].split(' ');

                    title = '最寄り駅_' + (i + 1);
                    let eng_title = JA_TO_ENG[title];
                    contents[eng_title] = station;

                    title = '最寄り駅_距離_' + (i + 1);
                    eng_title = JA_TO_ENG[title];
                    contents[eng_title] = distance;
                }
            } else if (shaped_title == '敷金/礼金') { // @HACK
                contents[JA_TO_ENG['敷金']] = shaped_data.split('/')[0]
                contents[JA_TO_ENG['礼金']] = shaped_data.split('/')[1]
            } else {
                //if (JA_TO_ENG[shaped_title] == undefined) throw new Error(); 
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

module.exports = {
    parseSUUMO,
};