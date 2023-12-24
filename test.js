const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

const SELECTORS_HOMES = { '物件名': 'h1 span.block', '基本情報': 'dl.w-full dt', '特徴・設備': 'ul.mt-3 div.grow.py-3 span', '物件概要': 'dl.-mx-px dt.flex' }
const DOES_USE_NEXT_CLASS_HOMES = { '物件名': false, '基本情報': true, '特徴・設備': false, '物件概要': true }



async function main() {
/*    const url = "https://suumo.jp/chintai/bc_100355755056/";
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    console.log($('h2').text()); */
    
    const browser = await puppeteer.launch({headless: "new"});
    const page = await browser.newPage();
    //ユーザーエージェントを設定
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');


    // 対象のURLを指定
    const url = "https://www.homes.co.jp/chintai/b-1241880048975/";

    // ページを開く
    await page.goto(url, { waitUntil: 'networkidle2' });

    // ページのHTMLを取得
    const html = await page.content();

    // HTMLを解析するためのcheerioのロード
    const $ = cheerio.load(html);

    // テキストを取得して出力
    console.log($('dl.-mx-px dt.flex').text());
    

    await browser.close();

}

if (require.main == module) {
    main();
}