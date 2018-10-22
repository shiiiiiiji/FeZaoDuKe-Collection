// const url = 'https://mp.weixin.qq.com/profile?src=3&timestamp=1529454868&ver=1&signature=07VDeMiUAG0av39cka13COjcq44y7n*Dm-SQWhg5*7Gb5Fti6yPqZHgtbdE-AqvR*QrOY9PiLSJO1mlLQo9yuw==';

var cheerio = require('cheerio');
var request = require('request');
var moment = require('moment');
var fs = require('fs');
var result = [];

const options = {
	method: 'POST',
	url: 'https://app.jike.ruguoapp.com/1.0/messages/history',
	headers: {
		Accept: 'application/json',
		'App-Version': '4.1.0',
		'Content-Type': 'application/json',
		Origin: 'http://web.okjike.com',
		platform: 'web',
		Referer:
			'http://web.okjike.com/topic/5848cace8a16f9001084a79d/official',
		'User-Agent':
			'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.79 Safari/537.36',
		'x-jike-app-auth-jwt':
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZW1vdGVfYWRkciI6IjQyLjgxLjEyNy4zIiwiYXBwX3VzZXJfaW5mbyI6eyJ1c2VySWQiOjc2MDAyODYsImlzTG9naW5Vc2VyIjp0cnVlLCJpZCI6IjU5OWJjYjE0YTcxNWYxMDAxMDc0ZDJhNSIsIl9pZCI6IjU5OWJjYjE0YTcxNWYxMDAxMDc0ZDJhNSIsInVzZXJuYW1lIjoiNTEyNWVlMTYtMjk2YS00Nzc3LWEwM2QtYjkwOWJkMzg1YTNiIiwiYmFuU3RhdHVzIjowfSwiZXhwaXJlc19hdCI6MTUzMDYwMTU0MC4wMzZ9.vzZJMsDgZ9mQtmk43z1X5SyyihfhMQxtkVFgrNEys4s'
	},
	body: JSON.stringify({
		limit: 20,
		loadMoreKey: null,
		topic: '5848cace8a16f9001084a79d'
	})
};

function callback(error, response, body) {
	if (!error && response.statusCode == 200) {
		const info = JSON.parse(body);
		const requestResult = info.data;
		if (requestResult && requestResult.length) {
			var res = '';
			for (let i = 0, len = requestResult.length; i < len; i++) {
				var itemDate = new Date(
					requestResult[i].createdAt
				).toLocaleDateString();
				var now = new Date(Date.now()).toLocaleDateString();
				// now = '2018-8-6';
				console.log(itemDate, now);
				if (itemDate !== now) {
					console.log('---');
					console.log('第', i, '后无新推送');
					console.log('---');
					break;
				}
				result.push({
					title: requestResult[i].content,
					date: moment(itemDate).format('YYYY-MM-DD'),
					link: requestResult[i].linkInfo.originalLinkUrl
				});
				// res += '- ' + now + '@佚名 [' +  + '](' + requestResult[i].linkInfo.originalLinkUrl + ')' + '\n';
			}
			// console.log(result);
			_request(index);
			// fs.writeFileSync('today.md',res,{flag:'w'});
		}
	}
}

request(options, callback);

var index = 0;
function _request(index) {
	console.time(index);
	request(result[index].link, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			console.timeEnd(index);
			var $ = cheerio.load(body);
			var author =
				$('#js_preview_reward_author_name').text() ||
				$('#js_preview_reward_author_name')
					.text()
					.trim();
			var author2 = $(
				'#meta_content > span.rich_media_meta.rich_media_meta_text'
			).innerText;
			result[index].author = author || author2;
			index++;
			if (index === result.length) {
				// console.log(result);
				var res = '';
				result.map(function(item, index) {
					res +=
						'- ' +
						item.date +
						'@' +
						(item.author || '佚名') +
						' [' +
						item.title +
						'](' +
						item.link +
						')' +
						'\n';
				});
				console.log('---');
				console.log(res);
				console.log('---');
				fs.writeFile(
					'today' + (new Date() - 0) + '.md',
					res,
					{
						flag: 'a'
					},
					function(err) {
						if (err) throw err;
						console.log('today.md已存在，内容被覆盖！');
					}
				);
			} else {
				_request(index);
			}
		}
	});
}
