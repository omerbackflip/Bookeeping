const path = require('path');

module.exports = {
	ServerApp : {
		google: {
			invoiceFolderIds: ['1p8jMDVJYkIjoZIsg3LmyJmuDKt7j29Fb'],
		},
		models : {
			invoice : 'invoices'
		},
		configFolderPath: path.join(__dirname ) + '/',
		uploadFolderPath: path.join(__dirname + '/../../uploads/'),
	}
};