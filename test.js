const axios = require('axios');
const cheerio = require('cheerio')


async function main() {
    const url = "https://suumo.jp/chintai/bc_100355755056/";
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    console.log($('h2').text());
}

if (require.main == module) {
    main();
}