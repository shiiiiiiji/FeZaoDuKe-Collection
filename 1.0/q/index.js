const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const iPhone = devices['iPhone 6'];
const fs = require('fs');
const h2m = require('h2m');

(async () => {
	// 获取数据
	async function getWxList(url) {
		const browser = await puppeteer.launch({
			headless: false
		});
		const page = await browser.newPage();

		await page.emulate(iPhone);

		// 打开公众号信息历史页
		await page.goto(url);

		await page.cookies(
			'wxtokenkey=777; devicetype=iOS11.4.1; lang=en; pass_ticket=NWPORzv7iXIeX0KzMg7zjRPjETWwEjZGbCPXUgifm3IqfL/oF8Z2jKn0qFkJO3j/; rewardsn=; version=16070227; wap_sid2=CMecq5ABEnBtNmtHUlBkck5qWlBQUUFxVDE4UjAzMDgwNmtIUmozbFBQbUN3LXotb2NVNld0aFI1TldvLU5jNnBaMExwRkdIY3BjazBxV3Fsa2lPUE4yTVdSbHJ2V1ZiQWJtLUd4b0h6dVhYRUF2OWU4Zk1Bd0FBMK3QvdwFOA1AAQ==; wxuin=302698055; pgv_pvid=1530680972; _ga=GA1.2.674353085.1535005357; pgv_pvi=8411962368; tvfe_boss_uuid=67595313b199b4fa; eas_sid=I1X5I3s189K4Q7c5J1S6H0u4s8; pac_uid=0_57b5897b942a6; sd_cookie_crttime=1529934264795; sd_userid=39261529934264795; ua_id=EAXsW5B7TQIslZY3AAAAALDeYXr0jmrA-gkVVgqI9-E='
		);

		await page.setUserAgent(
			'Mozilla/5.0 (iPhone; CPU iPhone OS 11_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15G77 MicroMessenger/6.7.2 NetType/WIFI Language/en'
		);

		// 设置头信息
		await page.setExtraHTTPHeaders({
			'X-WECHAT-KEY':
				'4dd052716412bc7a632af8dc4244d0a6bab10ef64b5e41d16698b68facfc7a446fb7a44e0ee7242be364fac92e20490bd1376b4a5c90318b694ea28fdc6f4ff9fa4363af9610d7fbcd3119c93263ab61',
			'X-WECHAT-UIN': 'MzAyNjk4MDU1'
		});

		await page.reload({
			waitUntil: 'load'
		});

		setInterval(function() {
			page.evaluate(() => {
				window.scrollBy(0, document.body.scrollHeight);
			});
		}, 1000);

		await page.waitFor(150000);

		// 获取首屏数据
		const wxlist = await page.evaluate(() => {
			const list = [...document.querySelectorAll('.weui_media_title')];

			return list.map(el => {
				//return `${el.getAttribute('hrefs')}`
				return `[${el.innerText}](${el.getAttribute('hrefs')})`;
			});
		});

		let temp = ``;
		wxlist.map(el => {
			temp += el + '\n\r';
		});

		console.log('开始生成...');
		fs.writeFile('fezaoduke-20180905.md', temp, function(err) {
			if (err) {
				console.error(err);
			} else {
				console.log('写入成功');
			}
		});
		console.log('结束生成...');

		page.close();
		browser.close();
	}
	getWxList(
		'https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MjM5MTA1MjAxMQ==&scene=126&devicetype=iOS11.4.1&version=16070227&lang=en&nettype=WIFI&a8scene=0&fontScale=100&pass_ticket=NWPORzv7iXIeX0KzMg7zjRPjETWwEjZGbCPXUgifm3IqfL%2FoF8Z2jKn0qFkJO3j%2F&wx_header=1'
	);
})();
