const db = require("../models");
const Invoice = db.invoices;
const Book = db.books;
const Table = db.tables;
const csv = require('csvtojson')
var fs = require('fs');

exports.saveInvoicesBulk = async (req, res) => {
	if (!req.body) {
		return res.status(400).send({
			message: "Data of bulk to update can not be empty!"
		});
	}
	try {
        await Promise.all([Invoice.deleteMany(), Table.deleteMany()]);
		let data = await csv().fromFile(`uploads/${req.file.filename}`);
		// creates "company" in Table with table_id = 1
        const uniqueCompany = [...new Set(data.map(item => item.company))];
		const companies = uniqueCompany.map(item => {return { 'table_id' : '1' , 'description' : item}});
		await Table.insertMany(companies, { ordered: true });

		// creates "Ptojects" in Table with table_id = 2
        const uniqueProjects = [...new Set(data.map(item => item.project))];
		const projects = uniqueProjects.map(item => {return { 'table_id' : '2' , 'description' : item}});
		await Table.insertMany(projects, { ordered: true });

		// creates "Suppliers" in Table with table_id = 3
        const uniqueSuppliers = [...new Set(data.map(item => item.supplier))];
		const suppliers = uniqueSuppliers.map(item => {return { 'table_id' : '3' , 'description' : item}});
		await Table.insertMany(suppliers, { ordered: true });

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
			if (item.asmacta1 != '') return updateExcelRecID(item.company, item.year, item.asmacta1, item.record_id)
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
			if (item.invoiceId) { // exclude items with no invoiceId
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

async function getMappedItems(filteredData, company) {
	const data = await Promise.all(filteredData.map(async (item) => {
		const { year, asmacta1, record_id } = item;
		if (company && year && asmacta1 != '') { // if no date - probbaly is Yitra...
			await updateExcelRecID(company, year, asmacta1, record_id);
		}
		const [month,day,year1] = item.asmchta_date.split('/')
		return {
			company,
			asmchta_date: new Date(+year1, +month-1, +day, +0, +0, +0),
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

exports.addPaymentsToInvoice = async(req,res) => {
		try {
        const { invoiceId } = req.params;
        const paymentsList = req.body;
        if(paymentsList) {
           await Invoice.updateOne({_id: invoiceId}, { payments: paymentsList })
        }
        return res.send({success: true, message: "Successfully added supplier to PROJECT"});

    } catch (error) {
        console.log(error)
		res.status(500).send({ message: "Error updating PROJECT with associated suppliers", error });
    }
}

function unLinkFile(path) {
	fs.unlinkSync(path);
}