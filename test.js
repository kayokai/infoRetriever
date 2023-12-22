const axios = require('axios');
const cheerio = require('cheerio')
const url = 'https://suumo.jp/chintai/jnc_000086387922/' // 映画.comランキングページ
const titles_arr = []


async function main() {
    const url = "https://suumo.jp/chintai/bc_100355755056";
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    print($('h1').text())
}

if (require.main == module) {
    main();
}