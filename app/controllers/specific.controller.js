const db = require("../models");
const Invoice = db.invoices;
const Book = db.books;
const Table = db.tables;
const Revenue = db.revenues;
const csv = require('csvtojson')
const XLSX = require('xlsx');
const path = require('path');
var fs = require('fs');
const { transformCSVData } = require("../util/util");
const { url } = require("../config/db.config");
const { version } = require("../config/db.config");
const specificService = require("../services/specific-service");
const { ServerApp } = require("../config/constants");
const dbService = require("../shared/mongoose/services/db-service");
// const { google } = require('googleapis');
const googleSubmoduleService = require('../services/google-submodule-service');
const backupService = require('../../backup/backend');
const backupConfig = require('../backup/backup.config');
const { getModel } = require('../backup/modelResolver');
const { normalizeCapturedMedia } = require('../../camera/backend');
const { uploadFile } = require('../../google/backend');
const { Readable } = require('stream');
const moment = require('moment');


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

exports.uploadInvoiceMedia = async (req, res) => {
  let uploadStep = "start";

  try {
    const { fileContent, group, capturedAt, mediaType } = req.body || {};

    if (!fileContent && !req.body.frames) {
      return res.status(400).send({ message: "Missing fileContent" });
    }

    if (!group) {
      return res.status(400).send({ message: "Missing invoice group" });
    }

    const folderId = ServerApp.google.invoiceFolderId;

    if (!folderId) {
      return res.status(500).send({ message: "Missing invoice Google Drive folder configuration" });
    }

    uploadStep = "google-auth";
    const oAuth2Client = googleSubmoduleService.getOAuthClientFromStoredTokens();

    uploadStep = "normalize-media";
    const media = await normalizeCapturedMedia(req.body);

    const prefix = mediaType === "video" || media.mediaType === "video" ? "invoice-video" : "invoice";
    const safeGroup = String(group).replace(/[^\w.-]+/g, "-");
    const filename = `${prefix}-${safeGroup}-${moment(new Date()).format("YYYY-MM-DD-HH.mm.ss")}${media.extension}`;

    uploadStep = "google-upload";
    const file = await uploadFile({
      oAuth2Client,
      name: filename,
      mimeType: media.mimeType,
      body: Readable.from([media.buffer]),
      folderId,
    });

    return res.send({
      success: true,
      file: {
        name: file.name,
        fileId: file.id,
        url: file.webViewLink,
        mimeType: media.mimeType,
        mediaType: media.mediaType,
        capturedAt: capturedAt || new Date(),
      },
    });
  } catch (error) {
    console.error(`uploadInvoiceMedia failed during ${uploadStep}:`, error);

    return res.status(500).send({
      message: error.message || "Some error while uploading invoice media to Google Drive",
      step: uploadStep,
    });
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
      username: null
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

exports.runRestore = async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).send({
        success: false,
        message: 'Backup ZIP file is required'
      });
    }

	if (!req.body || req.body.confirm !== 'YES') {
	return res.status(400).send({
		success: false,
		message: 'Restore requires confirmation: confirm=YES'
	});
	}

	const result = await backupService.runRestore({
	zipPath: req.file.path,
	config: backupConfig,
	getModel,
	tmpDir: path.resolve(__dirname, '../../tmp')
	});

    unLinkFile(req.file.path);

    return res.json(result);
  } catch (error) {
    console.error('runRestore error:', error);

    if (req.file && req.file.path) {
      try {
        unLinkFile(req.file.path);
      } catch (e) {}
    }

    return res.status(500).send({
      message: 'Error restoring backup',
      error: error.message || error
    });
  }
};

function unLinkFile(path) {
	fs.unlinkSync(path);
}
