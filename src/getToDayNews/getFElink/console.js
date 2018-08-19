function getToDayInfo(argument) {
	const data = msgList.list[0];
	const BASE_URL = 'https://mp.weixin.qq.com';

	if (!isToDay(data.comm_msg_info.datetime * 1000)) {
		console.log('暂无今日推送！');
		return false;
	}

	let res = [];

	addItem({
		date: formateTime(),
		author: data.app_msg_ext_info.author || '佚名',
		title: data.app_msg_ext_info.title,
		link: BASE_URL + data.app_msg_ext_info.content_url
	});

	const multiList = data.app_msg_ext_info.multi_app_msg_item_list;

	if (multiList && multiList.length) {
		multiList.map(function (item, index) {
			addItem({
				date: formateTime(),
				author: item.author,
				title: item.title,
				link: BASE_URL + item.content_url
			});
		});
	}

	return res.join('\n');

	function addItem(params) {
		const { date, author, title, link } = params
		const str = '- ' + date + '@' + author + ' [' + title + '](' + link + ')';
		res.push(str);
	}
	function isToDay(timestamp) {
		return (new Date(timestamp)).toDateString() == (new Date()).toDateString();
	}
	function formateTime(timestamp) {
		if (!timestamp) {
			_date = new Date();
		} else {
			_date = new Date(timestamp);
		}
		let _year = _date.getFullYear();
		let _mouth = _date.getMonth() + 1;
		let _day = _date.getDate();
		return (_year) + '-' + (_mouth < 10 ? '0' + _mouth : _mouth) + '-' + (_day) + '-';
	}
}
