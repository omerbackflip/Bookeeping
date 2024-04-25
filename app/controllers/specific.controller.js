const db = require("../models");
const Invoice = db.invoices;
const Book = db.books;
const Table = db.tables;
const Revenue = db.revenues;
const csv = require('csvtojson')
const XLSX = require('xlsx');
var fs = require('fs');
const { transformCSVData } = require("../util/util");
const { url } = require("../config/db.config");
const { version } = require("../config/db.config");
const specificService = require("../services/specific-service");

// exports.saveInvoicesBulk = async (req, res) => { // not in use - initially for getting data from previous MagicXPA (csv) 
// 	if (!req.body) {
// 		return res.status(400).send({
// 			message: "Data of bulk to update can not be empty!"
// 		});
// 	}
// 	try {
//         await Promise.all([Invoice.deleteMany(), Table.deleteMany()]);
// 		let data = await csv().fromFile(`uploads/${req.file.filename}`);
// 		// creates "company" in Table with table_id = 1
//         const uniqueCompany = [...new Set(data.map(item => item.company))];
// 		const companies = uniqueCompany.map(item => {return { 'table_id' : '1' , 'description' : item}});
// 		await Table.insertMany(companies, { ordered: true });

// 		// creates "Ptojects" in Table with table_id = 2
//         const uniqueProjects = [...new Set(data.map(item => item.project))];
// 		const projects = uniqueProjects.map(item => {return { 'table_id' : '2' , 'description' : item}});
// 		await Table.insertMany(projects, { ordered: true });

// 		// creates "Suppliers" in Table with table_id = 3
//         const uniqueSuppliers = [...new Set(data.map(item => item.supplier))];
// 		const suppliers = uniqueSuppliers.map(item => {return { 'table_id' : '3' , 'description' : item}});
// 		await Table.insertMany(suppliers, { ordered: true });

// 		data = data.map(item => item.published === 'TRUE' ? { ...item, published: true } : { ...item, published: false });
// 		if (data) {
// 			const result = await Invoice.insertMany(data, { ordered: true });
// 			unLinkFile(`uploads/${req.file.filename}`);
// 			if (result) {
// 				return res.send({
// 					success: true,
// 					message: `Total ${result.length} INVOICES successfully Imported`
// 				})
// 			}
// 		}

// 	} catch (error) {
// 		console.log(error)
// 		res.status(500).send({
// 			message: "Error saving bulk of Invoices"
// 		});
// 	}
// };

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

// exports.saveBooksBulk = async (req, res) => { // not in use - (csv)
// 	if (!req.body) {
// 		return res.status(400).send({
// 			message: "Data of bulk to update can not be empty!"
// 		});
// 	}

// 	try {
//         await Promise.all([Book.deleteMany({company: req.body.company, year: req.body.year})]);
// 		let data = await csv().fromFile(`uploads/${req.file.filename}`);
// 		if (data) {
// 			// filter out all items with no "asmchta_date"
// 			data = data.filter((item) => item.asmchta_date !== '');
// 			const allData = await getMappedItems(data, req.body.company);
// 			const result = await Book.insertMany(allData, { ordered: true });
// 			unLinkFile(`uploads/${req.file.filename}`);
// 			if (result) {
// 				return res.send({
// 					success: true,
// 					message: `Total ${result.length} BOOKS successfully Imported`
// 				})
// 			}
// 		}

// 	} catch (error) {
// 		console.log(error)
// 		res.status(500).send({
// 			message: "Error saving bulk of Books"
// 		});
// 	}
// };

exports.saveBooksBulk1 = async (req, res) => {
	try {
        await Book.deleteMany({company: req.body.company, year: req.body.year});
		var workbook = XLSX.readFile(`uploads/${req.file.filename}`,{type: 'binary', cellDates: true, dateNF: 'dd/mm/yyyy;@'});
		var sheet_name_list = workbook.SheetNames;
		const data = transformCSVData(sheet_name_list , workbook);

        let books = specificService.getBooksToSave(data[0], req.body.company);
		if (books) {
			books.map((item) => {
				if (item.asmacta1 && item.asmacta1 != '') return updateExcelRecID(item.company, item.year, item.asmacta1, item.record_id)
			})
			const result = await Book.insertMany(books, { ordered: true });
			unLinkFile(`uploads/${req.file.filename}`);
			if (result) {
				return res.send({
					success: true,
					message: `Total ${result.length} BOOKS successfully Imported`
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

// async function getMappedItems(filteredData, company) {  // not in use !!! used for the old read from csv
// 	const data = await Promise.all(filteredData.map(async (item) => {
// 		const { year, asmacta1, record_id } = item;
// 		if (company && year && asmacta1 != '') { // if no date - probbaly is Yitra...
// 			await updateExcelRecID(company, year, asmacta1, record_id);
// 		}
// 		const [day,month,year1] = item.asmchta_date.split('/')
// 		return {
// 			company,
// 			asmchta_date: new Date(+year1, +month-1, +day, +0, +0, +0),
// 			record_id: item.record_id,
// 			year: item.year,
// 			record_schum: item.record_schum,
// 			pratim: item.pratim,
// 			asmacta1: item.asmacta1,
// 			schum_hova: item.schum_hova,
// 			schum_zchut: item.schum_zchut,
// 			cust_lname: item.cust_lname,
// 			cust_fname: item.cust_fname,
// 			bs_item_name: item.bs_item_name,
// 			bs_group_name: item.bs_group_name,
// 		}
// 	}));
// 	return data;
// }

async function updateExcelRecID(company, year, invoiceId, excelRecID) {
	return await Invoice.findOneAndUpdate({
		company,
		year,
		invoiceId
	},
		{ excelRecID });
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

// not in used
// exports.addPaymentsToInvoice = async(req,res) => {
// 		try {
//         const { invoiceId } = req.params;
//         const paymentsList = req.body;
//         if(paymentsList) {
//            await Invoice.updateOne({_id: invoiceId}, { payments: paymentsList })
//         }
//         return res.send({success: true, message: "Successfully added supplier to PROJECT"});

//     } catch (error) {
//         console.log(error)
// 		res.status(500).send({ message: "Error updating PROJECT with associated suppliers", error });
//     }
// }


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

function unLinkFile(path) {
	fs.unlinkSync(path);
}