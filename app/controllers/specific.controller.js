const db = require("../models");
const Invoice = db.invoices;
const Book = db.books;
const Table = db.tables;
const Revenue = db.revenues;
const csv = require('csvtojson')
const XLSX = require('xlsx');
const path = require('path');
var fs = require('fs');
const { transformCSVData, createExcel } = require("../util/util");
const { url } = require("../config/db.config");
const { version } = require("../config/db.config");
const specificService = require("../services/specific-service");
const { ServerApp } = require("../config/constants");
const dbService = require("../services/db-service");
const { google } = require('googleapis');
const googleService = require('../services/google-service');

exports.saveInvoicesBulk1 = async (req, res) => {
	try {
        await Invoice.deleteMany();
		var workbook = XLSX.readFile(`uploads/${req.file.filename}`,{type: 'binary', cellDates: true, dateNF: 'dd/mm/yyyy;@'});
		var sheet_name_list = workbook.SheetNames;
		const data = transformCSVData(sheet_name_list , workbook);
        let invoices = specificService.getInvoicesToSave(data[0]);
		if (invoices) {
			const result = await Invoice.insertMany(invoices, { ordered: true });
			unLinkFile(`uploads/${req.file.filename}`);
			if (result) {
				return res.send({
					success: true,
					message: `Total ${result.length} INVOICES successfully Imported`
				})
			}
		}

	} catch (error) {
		console.log(error)
		res.status(500).send({
			message: "Error saving bulk of Books"
		});
	}
};

exports.saveBooksBulk1 = async (req, res) => {
	try {
        await Book.deleteMany({company: req.body.company, year: req.body.year});
		var workbook = XLSX.readFile(`uploads/${req.file.filename}`,{type: 'binary', cellDates: true, dateNF: 'dd/mm/yyyy;@'});
		var sheet_name_list = workbook.SheetNames;
		const data = transformCSVData(sheet_name_list , workbook);
        let books = specificService.getBooksToSave(data[0], req.body.company);
		if (books) {
			let totalMatch = 0;
			let response ;
			books.map(async(item) => {
				if (item.asmacta1 && item.asmacta1 != '') {
					response = await updateExcelRecID(item.company, item.year, item.asmacta1, item.record_id)
					if (response) (totalMatch = totalMatch + 1)
					return
				}
			})
			const result = await Book.insertMany(books, { ordered: true });
			unLinkFile(`uploads/${req.file.filename}`);
			if (result) {
				return res.send({
					success: true,
					message: `Total ${result.length} BOOKS successfully Imported and ${totalMatch} invoice updated`
				})
			}
		}
	} catch (error) {
		console.log(error)
		res.status(500).send({
			message: "Error saving bulk of Books"
		});
	}
};

exports.saveRevenuesBulk = async (req, res) => {
	if (!req.body) {
		return res.status(400).send({
			message: "Data of bulk to update can not be empty!"
		});
	}

	try {
        await Promise.all([Revenue.deleteMany()]);
		let data = await csv().fromFile(`uploads/${req.file.filename}`);
		// console.log(data)
		if (data) {
			const result = await Revenue.insertMany(data, { ordered: true });
			unLinkFile(`uploads/${req.file.filename}`);
			if (result) {
				return res.send({
					success: true,
					message: `Total ${result.length} REVENUES successfully Imported`
				})
			}
		}

	} catch (error) {
		console.log(error)
		res.status(500).send({
			message: "Error saving bulk of Revenues"
		});
	}
};

exports.saveRevenuesBulk1 = async (req, res) => {
	try {
        await Revenue.deleteMany();
		var workbook = XLSX.readFile(`uploads/${req.file.filename}`,{type: 'binary', cellDates: true, dateNF: 'dd/mm/yyyy;@'});
		var sheet_name_list = workbook.SheetNames;
		const data = transformCSVData(sheet_name_list , workbook);
        let revenues = specificService.getRevenuesToSave(data[0]);
		if (revenues) {
			const result = await Revenue.insertMany(revenues, { ordered: true });
			unLinkFile(`uploads/${req.file.filename}`);
			if (result) {
				return res.send({
					success: true,
					message: `Total ${result.length} REVENUES successfully Imported`
				})
			}
		}

	} catch (error) {
		console.log(error)
		res.status(500).send({
			message: "Error saving bulk of Books"
		});
	}
};

// Run whole asmacta1 in Book table, and find maching asnacta1=invoiceId in Invoice table and update excelRecID in Invoice with record_id
exports.batchBooksInvoices = async (req, res) => {
	if (!req.body) {
		return res.status(400).send({
			message: "batch Book Invoice can not be empty!"
		});
	}
	try {
		let data = await Book.find({});
		data.map((item) => {
			if (item.asmacta1 && item.asmacta1 != '') return updateExcelRecID(item.company, item.year, item.asmacta1, item.record_id)
		})	

	} catch (error) {
		console.log(error)
		res.status(500).send({
			message: "Error saving bulk of Invoices"
		});
	}	
}

// run on whole Invoice table, looks for match record_id in Book table and update excelRecID in Invoice with record_id
exports.batchInvoicesBooks = async (req, res) => {
	if (!req.body) {
		return res.status(400).send({
			message: "batch Book Invoice can not be empty!"
		});
	}
	try {
		let data = await Invoice.find({});
		data.map(async (item) => {
			if (item.invoiceId && item.invoiceId != '') { // exclude items with no invoiceId
				let record = await Book.findOne({company: item.company, year: item.year, asmacta1: item.invoiceId});
				if (record) return Invoice.findOneAndUpdate({_id: item._id},{excelRecID: record.record_id})
			}
		})	

	} catch (error) {
		console.log(error)
		res.status(500).send({
			message: "Error saving bulk of Invoices"
		});
	}
}

async function updateExcelRecID(company, year, invoiceId, excelRecID) {
	return await Invoice.findOneAndUpdate({
		company,
		year,
		invoiceId
	},
		{ excelRecID },
		{ new: true });
};

exports.batchClearExcelRecID = async (req, res) => {
	if (!req.body) {
		return res.status(400).send({
			message: "batch ExcelRecID can not be empty!"
		});
	}
	try {
		await Invoice.updateMany({year:req.body.year},{excelRecID:""})
	} catch (error) {
		console.log(error)
		res.status(500).send({
			message: "Error saving bulk of Invoices"
		});
	}	
}


// this fucntion updates exsiting specific payment (using payment._id) in specific invoice
exports.updatePaymentInInvoice = async(req,res) => {
	try {
	const { objIdOfPayment } = req.params;
	const payment = req.body;
	if(payment) {
	   await Invoice.updateOne({'payments._id': objIdOfPayment}, { $set: {'payments.$': payment} })
	}
	return res.send({success: true, message: "Successfully added supplier to PROJECT"});

	} catch (error) {
		console.log(error)
		res.status(500).send({ message: "Error updating PROJECT with associated suppliers", error });
	}
}

exports.getDbInfo = (req,res) => {
	try {
		const local = url.includes('localhost'); //retuens true/false
		return res.send({ success: true, local, version});
	} catch (error) {
		console.log(error)
		res.status(500).send({ message: "Error getting db info", error });
	}
};

exports.backup2GDrive = async (req, res) => { // upload Backup Excel
	try {
		const model = ServerApp.models.invoice;
		const invoices = await dbService.getMultipleItems(db[model], req.query);
		if (invoices) {
			let invoiceData = specificService.getInvoicesToExcelExport(invoices);
			let invoiceExecelFile =  createExcel(invoiceData);
			if(invoiceExecelFile){
				auth = googleService.getAuth();
				const file = await googleService.uploadBackup2GDrive(auth, invoiceExecelFile.filename);
				if(file.id){ // after uploading the excel file, remove the tmporary excel file from "upload" directory
					fs.unlinkSync(invoiceExecelFile.filePath);
				}
				res.send({success: true, file_id: file});
			}else{
				res.send({success: false, message: "Error! While generating invoice file."});
			}
		}
	} catch (error) {
		console.log(error)
		res.status(500).send({
			message: "Error while uploading invoices to google drive."
		});
	}	
};

exports.uploadInvoicesToGoogleDrive = async (req, res) => { // upload specific invoice/gpj
	const file = req.file;
	if (!req.file) {
	    return res.status(500).send({ message: "No file uploaded" });
	}
	const originalFileName = file.originalname; // Original file name
    const newFileName = path.basename(originalFileName, path.extname(originalFileName)) + '.png'; // Add or change to `.pdf`
    const newFilePath = path.join(file.destination, newFileName); // New file path

    // Rename or copy the file with the new name
    fs.renameSync(file.path, newFilePath);
	const {group} = req.body;
	let filepath = `${group}`;
	const auth = googleService.getAuth();
	const uploadedFile = await googleService.uploadInvoiceToGoogleDrive(auth, newFileName,filepath);
	fs.unlinkSync(newFilePath);
	if (!uploadedFile || !uploadedFile.id) {
	    return res.status(500).send({ message: 'Failed to upload the file to Google Drive!' });
	}
	res.send({success: true , uploadedFile:uploadedFile});
}

exports.googleConnectionStatus = async (req, res) => {
	try{
		let auth = googleService.getAuth();
		
		if(auth instanceof google.auth.OAuth2){
			
			const userInfo = await googleService.getUser(auth);
			const username = (userInfo != false ? userInfo.name : null);
			let token = JSON.parse(fs.readFileSync(ServerApp.configFolderPath + 'token.json'));
			const { access_token,refresh_token } = token;
			
			//if(!username){
				 await googleService.refreshAccessToken(auth,refresh_token);
				 token = JSON.parse(fs.readFileSync(ServerApp.configFolderPath + 'token.json'));
			//}

			const credentials = JSON.parse(fs.readFileSync(ServerApp.configFolderPath + 'google-credentials.json'));
			
  
  			const { client_secret, client_id,developer_key } = credentials.web;
  			

			res.send({
				connected: true,
				username: username,
				client_secret:client_secret,
				client_id:client_id,
				developerKey:developer_key,
				access_token:access_token,
				folderId:ServerApp.google.storeInvoiceFolderIds
			});

		}else{
			res.send({
				connected: false,
				authUrl: auth
			});
		}

	} catch (error) {
		console.log(error)
		res.status(500).send({
			message: "Error while checking google connection."
		});
	}
};

exports.googleAuthHandler = async (req, res) => {
	try{
		
		const oAuth2Client = googleService.getAuthClient();
		const code = req.query.code;

		googleService.getToken(oAuth2Client, code);
		
		res.redirect(`${process.env.CLIENT_URL}?success=true`);
		
	} catch (error) {
		console.log(error)
		res.status(500).send({
			message: "Error while checking google connection."
		});
	}
}

function unLinkFile(path) {
	fs.unlinkSync(path);
}