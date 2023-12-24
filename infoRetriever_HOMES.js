const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const util = require('util');
const { JA_TO_ENG, JA_TO_ENG_FEATURES_AND_FACILITIES } = require('./ElementNamesForParse.js'); // 日本語カラム -> キー の変換テーブル読み込み    

const SELECTORS_HOMES = { '物件名': 'h1 span.block', '基本情報': 'dl.w-full dt', '特徴・設備': 'ul.mt-3 div.grow.py-3 span', '物件概要': 'dl.-mx-px dt.flex' }
const DOES_USE_NEXT_CLASS_HOMES = { '物件名': false, '基本情報': true, '特徴・設備': false, '物件概要': true }


/* 簡易テスト */
async function main() {
    let list_keys_set = []
    const list_test_url = ['https://www.homes.co.jp/chintai/b-1241880044510/'];

    const browser = await puppeteer.launch({headless: "new"});

    for (test_url of list_test_url) {
        const result = await parseHOMES(browser, test_url);
        list_keys_set.push(new Set(Object.keys(result)))
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
async function parseHOMES(browser, url) {
    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        const content = await page.content();
        const $ = cheerio.load(content);

        // 物件名取得
        let propertyName = getPropertyName($);

        // 基本情報取得
        let basicInfo = getBasicInfo($);

        // 特徴・設備取得
        let featuresAndFacilities = getFeaturesAndFacilities($)

        // 物件概要取得
        let propertyDescription = getPropertyDescription($)

        // 結果の結合    
        let result = { ...propertyName, ...basicInfo , ...featuresAndFacilities, ...propertyDescription}
        
        // puppeteerで開いたページを閉じる
        await page.close();

        // 結果を返す    
        return result;
    } catch (error) {
        console.error('An error occured while getting the html file with puppeteer:', error);
        throw error;
    }
}

/**
 * 物件名を辞書形式で取得
 * @param {*} $ 
 * @returns dict
 */
function getPropertyName($) {
    //const LIST_SELECTORS_ALL = [SELECTORS_HOMES]
    let dictPropertyName = {};


    let selector = SELECTORS_HOMES['物件名'];
    dictPropertyName[JA_TO_ENG['物件名']] = $(selector).text().replace(/\s+/g, '');

    return dictPropertyName;
}

/**
 * 基本情報を辞書形式で取得
    *賃料
    *管理費・共益費
    * 敷金
    * 礼金
    * 保証金
    * 敷引・償却
    * 駅徒歩
    * 所在地
    * 築年数
    * 間取り
    * 向き
    * 専有面積
    * バルコニー
    * (Optional)解
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
    // すべての初期費用候補を'0'で初期化  
    let dictFeaturesAndFacilities = {};

    for (const feature of Object.values(JA_TO_ENG_FEATURES_AND_FACILITIES)) {
        dictFeaturesAndFacilities[feature] = 0;
    }

    // 初期費用を'1'に変更 
    
    let features = [];

    $(SELECTORS_HOMES['特徴・設備']).each(
        function(index, row) {
            if ($(row).text().includes('フリーレント')) {
                features[index] = 'フリーレント';
            } else {
            features[index] = $(row).text().replace('、', '');
            }
        }
    )
    for (const feature_ja of features) {
         dictFeaturesAndFacilities[JA_TO_ENG_FEATURES_AND_FACILITIES[feature_ja]] = 1;
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
    let dictTitleAndData = {};

    if (DOES_USE_NEXT_CLASS_HOMES[content]){
        dictTitleAndData = { ...extractWithNextElement($, SELECTORS_HOMES[content]), ...dictTitleAndData}
    } else {
        dictTitleAndData = { ...getTitleAndDataDevidedByColumn($, SELECTORS_HOMES[content]), dictTitleAndData}
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
            // dt element　を取得
            let title = $(row).text();

            // dt element の次要素 dd element を取得
            let data = $($(row).next()).text();

            //整形
            let shaped_title = title.replace(/\s+/g, '');
            let shaped_data = data.replace(/\s+/g, '');

            if (shaped_title == '敷金/礼金') { // @HACK
                contents[JA_TO_ENG['敷金']] = shaped_data.split('/')[0]
                contents[JA_TO_ENG['礼金']] = shaped_data.split('/')[1]
            } else if (shaped_title == '保証金/敷引・償却金') {
                contents[JA_TO_ENG['保証金']] = shaped_data.split('/')[0]
                contents[JA_TO_ENG['敷引・償却']] = shaped_data.split('/')[1]
            } else if (shaped_title == '交通') {
                const regex = /\D+(\d+分)/g;
                const stationAndDistances = shaped_data.match(regex);
                
                for (let i = 0; i < 3; i++) {
                    if (!stationAndDistances[i]) continue;
                    let station = stationAndDistances[i].replace(/徒歩\d+分/g, '');
                    let distance = stationAndDistances[i].replace(station, '');

                    title = '最寄り駅_' + (i + 1);
                    let eng_title = JA_TO_ENG[title];
                    contents[eng_title] = station;

                    title = '最寄り駅_距離_' + (i + 1);
                    eng_title = JA_TO_ENG[title];
                    contents[eng_title] = distance;
                }
            } else if (shaped_title == '所在地') {
                contents[JA_TO_ENG['所在地']] = shaped_data.replace('地図を見る', '')
            } else if (shaped_title == '所在階/階数'){
                contents[JA_TO_ENG['階']] = shaped_data.split('/')[0]
                contents[JA_TO_ENG['階建']] = shaped_data.split('/')[1]
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
    parseHOMES,
};