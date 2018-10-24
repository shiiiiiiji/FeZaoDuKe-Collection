/*
 * @User: uhr(ze.zh@hotmail.com)
 * @Date: 2018-10-22 23:04:17
 * @Desc: 更新前端早读课文章并上传到 Github 仓库
 * @Repo: https://github.com/uhr/FeZaoDuKe-Collection
 */
const later = require('later')

const handlerUpdate = require('./update')

// node app.js 设置自动更新
later.date.localTime()
later.setInterval(handlerUpdate, {
	schedules: [{
			h: [08],
			m: [00]
		},{
			h: [08],
			m: [30]
		},
		{
			h: [10],
			m: [30]
		},
		{
			h: [16],
			m: [00]
		},
		{
			h: [22],
			m: [00]
		},
	]
})