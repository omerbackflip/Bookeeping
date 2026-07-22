const path = require('path');

module.exports = {
	ServerApp : {
		google: {
			invoiceFolderId: process.env.GOOGLE_INVOICE_FOLDER_ID || '1_rZaYVFJQVsyHq_8diKmU_dqb5lbNEyJ',
		},
		models : {
			invoice : 'invoices'
		},
		configFolderPath: path.join(__dirname ) + '/',
		uploadFolderPath: path.join(__dirname + '/../../uploads/'),
	}
};
