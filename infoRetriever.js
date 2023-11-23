// 参考
// https://www.tohoho-web.com/js/jquery/index.htm#selector

const axios = require('axios');
const cheerio = require('cheerio');
const util = require('util');

const url = 'https://suumo.jp/chintai/jnc_000086387922/';

axios.get(url)
    .then(response => {

        /*
        result = {"<データ取得箇所>": データ辞書}
        */

        result = {}
        const $ = cheerio.load(response.data);

        // 各要素からデータ取得
        result["基本情報"] = propertyViewNoteToDic($)
        result["ランディングテーブル"] = headerAndDataToDict($, '.property_view_table  th')
        result["部屋の特長・設備"] = headerAndDataToDict($, '#bkdt-option  li')
        result["物件概要"] = headerAndDataToDict($, '.data_table  th')

        console.log(util.inspect(result, { showHidden: false, depth: null }))
    })

    .catch(error => {
        console.error('an error occured while getting the html with axios:', error);
    });


function headerAndDataToDict($, selector) {
    let contents = {}
    $(selector).each(
        function (index, row) {
            // th elementを取得
            let header = $(row).text()

            // row == th elementの次要素$(row).next()であるtd elementを取得
            let data = $($(row).next()).text()

            // 整形
            shaped_header = header.replace(/[\n\t]/g, '')
            shaped_data = data.replace(/[\n\t]/g, '')

            contents[shaped_header] = shaped_data
        }
    );
    return contents
}

function propertyViewNoteToDic($) {
    contents = {}
    $('.property_view_note-info span').each(
        function (index, span) {
            // th elementを取得
            let content = $(span).text()

            // 整形
            shaped_content = content.replace(/\s+/g, '')

            // 辞書への変形
            if (shaped_content.match(/:/)) {  // ':'でheaderとdataに分割する
                keyValue = shaped_content.split(':')
            } else { // 家賃のラベルはないのでつける
                keyValue = ['家賃', shaped_content]
            }

            contents[keyValue[0]] = keyValue[1]
        }
    );
    return contents
}