const fs = require('fs');
const path = require('path');
const rp = require('request-promise');
const moment = require('moment');
const simpleGit = require('simple-git')(path.join('../'));
const _ = require('underscore')

let updateResult = []; // 更新结果

/**
 * @msg: 更新入口
 * @param {type} 
 * @return: 
 */
function handleUpdate() {
	console.log('\n--- Task Start ---');
	let prevUpdate = require('../data/prev.json');
	console.log(prevUpdate);
	let hasUpdateToday = isToday(prevUpdate);
	updateResult = [];
	if (hasUpdateToday) {
		console.log(_now() + ' - 今日已更新:)');
		console.log('--- Task End ---\n');
		return false;
	}
	console.log(_now() + ' - 开始更新...');
	simpleGit
		.pull()
		.exec(update);
}

/**
 * @msg: 抓取数据
 * @param {type} 
 * @return: 
 */
function update() {
	// 请求数据
	const options = {
		method: 'POST',
		url: 'https://app.jike.ruguoapp.com/1.0/messages/history',
		headers: {
			Accept: 'application/json',
			'App-Version': '4.1.0',
			'Content-Type': 'application/json',
			Origin: 'http://web.okjike.com',
			platform: 'web',
			Referer: 'http://web.okjike.com/topic/5848cace8a16f9001084a79d/official',
			'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.79 Safari/537.36',
			'x-jike-app-auth-jwt': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZW1vdGVfYWRkciI6IjQyLjgxLjEyNy4zIiwiYXBwX3VzZXJfaW5mbyI6eyJ1c2VySWQiOjc2MDAyODYsImlzTG9naW5Vc2VyIjp0cnVlLCJpZCI6IjU5OWJjYjE0YTcxNWYxMDAxMDc0ZDJhNSIsIl9pZCI6IjU5OWJjYjE0YTcxNWYxMDAxMDc0ZDJhNSIsInVzZXJuYW1lIjoiNTEyNWVlMTYtMjk2YS00Nzc3LWEwM2QtYjkwOWJkMzg1YTNiIiwiYmFuU3RhdHVzIjowfSwiZXhwaXJlc19hdCI6MTUzMDYwMTU0MC4wMzZ9.vzZJMsDgZ9mQtmk43z1X5SyyihfhMQxtkVFgrNEys4s'
		},
		body: JSON.stringify({
			limit: 20,
			loadMoreKey: null,
			topic: '5848cace8a16f9001084a79d'
		})
	};

	rp(options)
		.then(res => {
			if (!res) handleEmpty();
			let resObj = {};
			resObj = typeof res === 'object' ? res : JSON.parse(res);
			let getData = resObj && resObj.data || [];
			if (getData && getData.length) {
				getData.forEach(item => {
					let getDate = moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss');
					if (isToday(getDate)) {
						updateResult.push({
							date: moment(item.createdAt).format('YYYY-MM-DD'),
							title: item.content,
							link: item.linkInfo.originalLinkUrl
						});
					}
				});
				if (updateResult.length) {
					handleREADME();
					handleAPPEND();
					handlerCommit();
				} else {
					console.log(_now() + ' - 本次更新无数据！等待下次任务执行:(');
					console.log('--- Task End ---\n');
				}
			}
		})
		.catch(function (err) {
			console.log(_now() + ' - 请求出错！等待下次任务执行:(');
			console.log(err);
			console.log('--- Task End ---\n');
			return false;
		});
}

/**
 * @msg: 渲染 README.md 文件
 * @param {type} 
 * @return: 
 */
function handleREADME() {
	let content = fs.readFileSync('../template.md');
	let compiled = _.template(content.toString());
	content = compiled({
		currentDate: _now(),
		data: updateResult
	})
	fs.writeFileSync('../README.md', content, 'utf-8');
}

/**
 * @msg: 添加到汇总文件
 * @param {type} 
 * @return: 
 */
function handleAPPEND() {
	updateResult.forEach(item => {
		fs.appendFileSync('../SUMMARY.md', `| ${item.date} | [${item.title}](${item.link}) |\n`, 'utf-8');
		fs.writeFileSync('../data/prev.json', `"${moment().format('YYYY-MM-DD')}"`, 'utf-8'); // 今日是否更新
	});
}

/**
 * @msg: 提交修改到 Git 仓库
 * @param {type} 
 * @return: 
 */
function handlerCommit() {
	console.log(_now() + ' - 本次更新完成，即将提交到 Github');
	simpleGit
		.addConfig('user.name', 'uhr')
		.addConfig('user.email', 'ze.zh@hotmail.com')
		.add('./*')
		.commit(':beers: 自动更新： ' + updateResult[0].title + '等' + updateResult.length + '条数据')
		.push(['-u', 'origin', 'master'], () => {
			console.log(_now() + ' - 提交成功:)\n--- Task End ---\n')
		});
}

/**
 * @msg: 无数据处理
 * @param {type} 
 * @return: 
 */
function handleEmpty() {
	console.log(`${_now()} - 本次更新无数据！`);
}

/**
 * @msg: 判断是今天
 * @param {type} 
 * @return: 
 */
function isToday(t1, t2) {
	// return !moment(t2).diff(moment(t1), 'days');
	return moment(t1).format('YYYY-MM-DD') === moment(t2).format('YYYY-MM-DD');
}

/**
 * @msg: 格式化当前时间
 * @param null
 * @return: YYYY-MM-DD HH:mm:ss
 */
function _now() {
	return moment().format('YYYY-MM-DD HH:mm:ss');
}

module.exports = handleUpdate;