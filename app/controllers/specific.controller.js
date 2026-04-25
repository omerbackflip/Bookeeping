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
// const { google } = require('googleapis');
const googleSubmoduleService = require('../../google/backend/services/google-submodule-service');
const backupService = require('../../backup/backend');
const backupConfig = require('../backup/backup.config');
const { getModel } = require('../backup/modelResolver');


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

exports.googleConnectionStatus = async (req, res) => {
  try {
    const tokens = googleSubmoduleService.getStoredTokens();

    if (!tokens) {
      return res.send({
        connected: false,
        authUrl: '/api/google/auth'
      });
    }

    return res.send({
      connected: true,
      username: null,
      client_id: process.env.VUE_APP_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
      developerKey: process.env.VUE_APP_GOOGLE_API_KEY || null,
      locale: process.env.VUE_APP_GOOGLE_PICKER_LOCALE || 'en',
      access_token: tokens.access_token || null,
      folderId: ServerApp.google.storeInvoiceFolderIds
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while checking google connection."
    });
  }
};

exports.runBackup = async (req, res) => {
  try {
    const result = await backupService.runBackup({
      config: backupConfig,
      getModel,
      uploader: googleSubmoduleService.uploadFileToDrive,
      tmpDir: path.resolve(__dirname, '../../tmp')
    });

    return res.json(result);
  } catch (error) {
    console.error('runBackup error:', error);
    return res.status(500).send({
      message: 'Error creating backup',
      error: error.message || error
    });
  }
};

function unLinkFile(path) {
	fs.unlinkSync(path);
}