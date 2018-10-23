const path = require('path');
const simpleGit = require('simple-git')(path.join('../'));

simpleGit
	.status((err, status) => {
		console.log(status);
	})