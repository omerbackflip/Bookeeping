const path = require('path');

module.exports = {
	ServerApp : {
		google: {
			invoiceFolderIds: '1BvNLoUo14eK-HPVbArD_G6NcR769L7aS', // this is the id of "backup" folder in Google-Drive
		},
		models : {
			invoice : 'invoices'
		},
		configFolderPath: path.join(__dirname ) + '/',
		uploadFolderPath: path.join(__dirname + '/../../uploads/'),
	}
};