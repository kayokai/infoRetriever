// 参考
// https://www.tohoho-web.com/js/jquery/index.htm#selector

const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://suumo.jp/chintai/jnc_000086387922/';

axios.get(url)
    .then(response => {

        /*
        result = {"<データ取得箇所>": データ辞書}
        */

        result = {}
        const $ = cheerio.load(response.data);

        // 各要素からデータ取得
        result["ランディングテーブル"] = headerAndDataToDict($, '.property_view_table  th')
        result["部屋の特長・設備"] = headerAndDataToDict($, '#bkdt-option  li')
        result["物件概要"] = headerAndDataToDict($, '.data_table  th')

        console.log(result)
    })
    .catch(error => {
        console.error('an error occured while getting the html with axios:', error);
    });


function headerAndDataToDict($, selector) {
    let content = {}
    $(selector).each(
        function (index, row) {
            // th elementを取得
            let shaped_header = $(row).text()
            // row == th elementの次要素$(row).next()であるtd elementを取得
            let shaped_data = $($(row).next()).text()
            // 整形
            shaped_header = shaped_header.replace(/[\n\t]/g, '')
            shaped_data = shaped_data.replace(/[\n\t]/g, '')
            content[shaped_header] = shaped_data
        }
    );
    return content
}