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
const dbService = require("../shared/mongoose/services/db-service");
const { google } = require('googleapis');
// const googleService = require('../services/google-service');
const googleSubmoduleService = require('../services/google-submodule-service');


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
		// const local = url.includes('localhost'); //retuens true/false
		const local = url.includes('127.0.0.1'); //retuens true/false
		return res.send({ success: true, local, version});
	} catch (error) {
		console.log(error)
		res.status(500).send({ message: "Error getting db info", error });
	}
};

exports.backup2GDrive = async (req, res) => { // upload Backup Excel
	try {
		const model = ServerApp.models.invoice;
		const invoices = await dbService.getEntities({ model: db[model], filter: req.query });
		if (invoices) {
			let invoiceData = specificService.getInvoicesToExcelExport(invoices);
			let invoiceExecelFile =  createExcel(invoiceData);
			if(invoiceExecelFile){
				const file = await googleSubmoduleService.uploadBackupExcelToDrive(invoiceExecelFile.filename);
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
  try {
    const file = req.file;

    if (!file) {
      return res.status(500).send({ message: "No file uploaded" });
    }

    const originalFileName = file.originalname;
    const newFileName = path.basename(originalFileName, path.extname(originalFileName)) + '.png';
    const newFilePath = path.join(file.destination, newFileName);

    fs.renameSync(file.path, newFilePath);

    const uploadedFile = await googleSubmoduleService.uploadFileToDrive(
      newFilePath,
      ServerApp.google.storeInvoiceFolderIds[0],
      'image/png',
      newFileName
    );

    fs.unlinkSync(newFilePath);

    if (!uploadedFile || !uploadedFile.id) {
      return res.status(500).send({ message: 'Failed to upload the file to Google Drive!' });
    }

    return res.send({ success: true, uploadedFile });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: 'Error while uploading the file to Google Drive.',
      error: error.message || error
    });
  }
}

exports.googleConnectionStatus = async (req, res) => {
  try {
    const tokenPath = ServerApp.configFolderPath + 'token.json';
    const credentialsPath = ServerApp.configFolderPath + 'google-credentials.json';

    const tokenExists = fs.existsSync(tokenPath);
	const client_secret = process.env.GOOGLE_CLIENT_SECRET;
	const client_id = process.env.GOOGLE_CLIENT_ID;
	const developerKey = process.env.VUE_APP_GOOGLE_API_KEY || null;

    if (!tokenExists) {
      return res.send({
        connected: false,
        authUrl: '/api/google/auth'
      });
    }
    const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    const { access_token } = token;

    return res.send({
      connected: true,
      username: null,
      client_secret,
      client_id,
      developerKey: developerKey,
      access_token,
      folderId: ServerApp.google.storeInvoiceFolderIds
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while checking google connection."
    });
  }
};

function unLinkFile(path) {
	fs.unlinkSync(path);
}