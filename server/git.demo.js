const path = require('path');
const simpleGit = require('simple-git')(path.join('../'));

simpleGit
	.add('.')
	.commit(':beers: 测试')
	.push(['-u', 'origin', 'master'], () => {
		console.log('done')
	});