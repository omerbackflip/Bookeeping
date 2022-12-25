const db = require("../models");
const Invoice = db.invoices;
const Book = db.books;
const csv = require('csvtojson')
var fs = require('fs');
const { books } = require("../models");

exports.saveInvoicesBulk = async (req, res) => {
	if (!req.body) {
		return res.status(400).send({
			message: "Data of bulk to update can not be empty!"
		});
	}
	try {
        await Promise.all([Invoice.deleteMany()]);
		let data = await csv().fromFile(`uploads/${req.file.filename}`);
		data = data.map(item => item.published === 'T' ? { ...item, published: true } : { ...item, published: false });
		if (data) {
			const result = await Invoice.insertMany(data, { ordered: true });
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
			message: "Error saving bulk of Invoices"
		});
	}
};


exports.saveBooksBulk = async (req, res) => {
	if (!req.body) {
		return res.status(400).send({
			message: "Data of bulk to update can not be empty!"
		});
	}

	try {
        await Promise.all([Book.deleteMany({company: req.body.company, year: req.body.year})]);
		let data = await csv().fromFile(`uploads/${req.file.filename}`);
		if (data) {
			// filter out all items with no "asmchta_date"
			data = data.filter((item) => item.asmchta_date !== '');
			const allData = await getMappedItems(data, req.body.company);
			const result = await Book.insertMany(allData, { ordered: true });
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
			message: "Error saving bulk of Invoices"
		});
	}
};

async function getMappedItems(filteredData, company) {
	const data = await Promise.all(filteredData.map(async (item, i) => {
		const { year, asmacta1, record_id } = item;
		if (company && year && asmacta1) { // if no date - probbaly is Yitra...
			await updateExcelRecID(company, year, asmacta1, record_id);
		}
		return {
			company,
			asmchta_date: item.asmchta_date,
			record_id: item.record_id,
			year: item.year,
			record_schum: item.record_schum,
			pratim: item.pratim,
			asmacta1: item.asmacta1,
			schum_hova: item.schum_hova,
			schum_zchut: item.schum_zchut,
			cust_lname: item.cust_lname,
			cust_fname: item.cust_fname,
			bs_item_name: item.bs_item_name,
			bs_group_name: item.bs_group_name,
		}
	}));
	return data;
}

async function updateExcelRecID(company, year, invoiceId, excelRecID) {
	return await Invoice.findOneAndUpdate({
		company,
		year,
		invoiceId
	},
		{ excelRecID });
};

function unLinkFile(path) {
	fs.unlinkSync(path);
}