const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const util = require('util');
const { JA_TO_ENG, JA_TO_ENG_FEATURES_AND_FACILITIES } = require('./ElementNamesForParse.js'); // 日本語カラム -> キー の変換テーブル読み込み    

const SELECTORS_ATHOME = { '物件名': '.heading .name', '基本情報': '.bukkenOverviewInfo .dataTbl th', '設備・特徴': '.bukken-info .dataTbl:eq(0) td', '費用': '.bukken-info .dataTbl:eq(1) th', 'その他物件情報': '.bukken-other-info__left .dataTbl th'};
const DOES_USE_NEXT_CLASS_ATHOME = { '物件名': false, '基本情報': true, '設備・特徴': false, '費用': true, 'その他物件情報': true }


/* 簡易テスト */
async function main() {
    let list_keys_set = []
    const list_test_url = ['https://www.athome.co.jp/chintai/1027048290/'];
    //const browser = await puppeteer.launch({headless: 'new'});

    for (test_url of list_test_url) {
        const result = await parseATHOME(test_url);
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
async function parseATHOME(url) {
    try {
        const browser = await puppeteer.launch({headless: 'new'});
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        //await page.waitForSelector('.bukkenOverviewInfo');
        const content = await page.content();
        const $ = cheerio.load(content);

        // 認証ページ又は削除済みのページの場合にエラーを返す
        pageAnalyse($);

        // 掲載物件名取得
        let propertyName = getPropertyName($);

        // 基本情報取得
        let basicInfo = getBasicInfo($);

        // 設備・特徴取得
        let featuresAndFacilities = getFeaturesAndFacilities($);

        // 費用取得
        let cost = getCost($);

        // その他物件情報取得
        let propertyDescription = getPropertyDescription($);

        // 結果の結合    
        let result = { ...propertyName, ...basicInfo, ...cost, ...propertyDescription , ...featuresAndFacilities};
        
        // puppeteerで開いたブラウザを閉じる
        await browser.close();

        // 結果を返す    
        return result;
    } catch (error) {
        console.error('An error occured while getting the html file with puppeteer:', error);
        throw error;
    }
}

function pageAnalyse($) {
    if ($('#error-header .heading').text() == 'お探しのページが見つかりません') throw 'お探しのページが見つかりません';
    else if ($('body .container .center h2').text() == '認証にご協力ください。') throw '認証ページに飛ばされました。時間を空けてください。';
}

/**
 * 掲載物件名を辞書形式で取得
 * @param {*} $ 
 * @returns
 */
function getPropertyName($) {
    //const LIST_SELECTORS_ALL = [SELECTORS_ATHOME]
    let dictPropertyName = {};
    let selector = SELECTORS_ATHOME['物件名'];
    dictPropertyName[JA_TO_ENG['掲載物件名']] = $(selector).text();
    
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

    $(SELECTORS_ATHOME['設備・特徴']).each(
        function(index, row) {
            let features = $(row).text().split('、');
            for (const feature_ja of features) {
                if (JA_TO_ENG_FEATURES_AND_FACILITIES[feature_ja] == undefined) {
                    JA_TO_ENG_FEATURES_AND_FACILITIES[feature_ja] = 'ヘッダーなし' + feature_ja;
                }
                dictFeaturesAndFacilities[JA_TO_ENG_FEATURES_AND_FACILITIES[feature_ja]] = 1;
            }
        }
    )
    
    return dictFeaturesAndFacilities;
}

/**
 * 費用を辞書形式で取得
 * @param {*} $ 
 * @returns dict
 */
function getCost($) {
    return getTitleAndData($, '費用');
}

/**
 * その他物件情報を辞書形式で取得
 * @param {*} $ 
 * @returns 
 */
function getPropertyDescription($) {
    return getTitleAndData($, 'その他物件情報');
}

/**
 * contentに関するtitleとdateを取得
 * @param {*} $ 
 * @param {*} content 取得情報の概要（日本語）
 * @returns dict 
 */
function getTitleAndData($, content) {   
    let dictTitleAndData = {};

    if (DOES_USE_NEXT_CLASS_ATHOME[content]){
        dictTitleAndData = { ...extractWithNextElement($, SELECTORS_ATHOME[content]), ...dictTitleAndData}
    } else {
        dictTitleAndData = { ...getTitleAndDataDevidedByColumn($, SELECTORS_ATHOME[content]), dictTitleAndData}
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
            let shaped_title = title.replace(/[\n\t]/g, '');
            let shaped_data = data.replace(/[\n\t]/g, '');

            if (shaped_title == '賃料') {
                shaped_data = shaped_data.replace('初期費用めやすを確認する', '');
            }
            else if (shaped_title == '住所') {
                shaped_data = shaped_data.replace('地図で見る', '');
            }
            if (shaped_title == '交通') {
                let stationAndDistances = shaped_data.split('（電車ルート案内）');
                stationAndDistances.forEach((stationAndDistance, index) => {
                    let station = stationAndDistance.replace(/(徒|停)歩\d+分/, '');
                    let distance = stationAndDistance.replace(station, '');

                    let eng_title_st = JA_TO_ENG['最寄り駅_' + (index + 1)];
                    contents[eng_title_st] = station;

                    let eng_title_d = JA_TO_ENG['最寄り駅_距離_' + (index + 1)];
                    contents[eng_title_d] = distance;
                })
            }
            else if (shaped_title == '階建 / 階') {
                contents[JA_TO_ENG['階']] = shaped_data.split('/')[0];
                contents[JA_TO_ENG['階建']] = shaped_data.split('/')[1];
            }
            else if (shaped_title == '敷金 / 保証金') {
                contents[JA_TO_ENG['敷金']] = shaped_data.split('/')[0];
                contents[JA_TO_ENG['保証金']] = shaped_data.split('/')[1];
            }
            else if (shaped_title == '建物名・部屋番号') {
                contents[JA_TO_ENG['物件名']] = shaped_data.split(' ')[0];
                if (shaped_data.split(' ')[1]) contents[JA_TO_ENG['部屋番号']] = shaped_data.split(' ')[1];
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
    parseATHOME,
};