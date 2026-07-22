const path = require('path');

module.exports = {
	ServerApp : {
		google: {
			invoiceFolderId: process.env.GOOGLE_INVOICE_FOLDER_ID,
		},
		models : {
			invoice : 'invoices'
		},
		configFolderPath: path.join(__dirname ) + '/',
		uploadFolderPath: path.join(__dirname + '/../../uploads/'),
	}
};
