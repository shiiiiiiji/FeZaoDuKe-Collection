const https = require('https');
const fs = require('fs');
const cheerio = require('cheerio');
var request = require('request');
const { ZAODUKE } = require('./data.js');

function _trim(str) {
    if (!str) return false;
    return str.trim();
}

function _black(str) {
    return str.replace(/\s+/g, "");
}

const len = ZAODUKE.length;
let i = len - 1;
let flag = true;

_request(i);

function _request(index) {
    console.time(index);
    request(ZAODUKE[index], function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);

            var title = _black($('h2').text() || '自定义标题');
            var author = _black($('span.rich_media_meta_text').text() || '佚名');
            var reg = /([0-9]{4}-[0-9]{2}-[0-9]{2})/g;
            var tmp;
            while ((tmp = reg.exec(body)) !== null) {
                var date = tmp[0] || '';
            }
            var str = '- ' + date + '@' + author + ' [' + title + '](' + ZAODUKE[index] + ')' + '\n';
            console.log(str);

            fs.appendFile('data_1.txt', str, (error) => {
                if (error) {
                    fs.appendFile('data_1.txt', index + ' error');
                    return false;
                }
                console.timeEnd(index);
                if (!flag) return false;
                if (index) {
                    index--;
                } else {
                    return false;
                }
                setTimeout(() => {
                    _request(index);
                }, parseInt(Math.random() * 10));
            })
        } else {
            fs.appendFile('data_1.txt', index + ' error');
            return false;
        }
    });
}