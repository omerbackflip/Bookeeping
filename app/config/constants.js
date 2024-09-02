const path = require('path');

module.exports = {
	ServerApp : {
		google: {
			invoiceFolderIds: ['1nB3lzLf8lgszVEXK4hcGW1LuPl6-OonU'], // this is the id of "backup" folder in Google-Drive
		},
		models : {
			invoice : 'invoices'
		},
		configFolderPath: path.join(__dirname ) + '/',
		uploadFolderPath: path.join(__dirname + '/../../uploads/'),
	}
};