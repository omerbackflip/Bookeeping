const db = require("../models");
const Tutorial = db.tutorials;
const Book = db.books;
const csv=require('csvtojson')
var fs = require('fs');

//Create and Save a new Tutorial:
exports.create = (req, res) => {
	// Validate request
	if (!req.body.company) {
		res.status(400).send({ message: "Content can not be empty!" });
		return;
	}

	// Create a Tutorial
	const tutorial = new Tutorial({
		company: req.body.company,
		project: req.body.project,
		description: req.body.description,
		published: req.body.published ? req.body.published : false,
		amount: req.body.amount,
		vat: req.body.vat,
		total: req.body.total,
		group: req.body.group,
		date: req.body.date,
		supplier: req.body.supplier,
		invoiceId: req.body.invoiceId,
		remark: req.body.remark,
		excelRecID: req.body.excelRecID,
		year: req.body.year,
	});

	// Save Tutorial in the database
	tutorial
		.save(tutorial)
		.then(data => {
			res.send(data);
		})
		.catch(err => {
			res.status(500).send({
				message:
					err.message || "Some error occurred while creating the Tutorial."
			});
		});
};


//Retrieve all Tutorials/ find by title from the database:
//We use req.query.title to get query string from the Request and consider it as condition for findAll() method.
//Eli Gadot - change the search from title to description 
//also change in TutorialDataService from /tutorials?title to /tutorials?description)
exports.findAll = async (req, res) => {
	// const search = req.query.description;
	// var condition = search ? { description: { $regex: new RegExp(search), $options: "i" } } : {};
	let condition = {};
	const {year,description} = req.query;	
	
	if (year && year != 'ALL') {
		condition = {year};
	} 
	
	if (description) {
		condition = { 
			...condition , 
			description: { $regex: new RegExp(description), $options: "i" }
		}
	}

	const data = await Tutorial.find(condition).lean();
	try {
		const allData = await Promise.all(data.map(async (mapData) => {
			mapData.vat = mapData.vat?.toLocaleString();
			mapData.amount = mapData.amount?.toLocaleString();

			if (await Book.exists({ company: mapData.company, record_id: mapData.excelRecID })) {
				// if(mapData.excelRecID) {
				const item = await Book.findOne({ company: mapData.company, record_id: mapData.excelRecID });
				return {
					...mapData,
					toolTip:`${item.pratim} - ${item.record_schum ?Number(item.record_schum).toLocaleString() : '' } - ${item.cust_lname}`,
					pratim: item.pratim,
					record_schum: item.record_schum,
					cust_lname: item.cust_lname,
					cust_fname: item.cust_fname
				};
			} 
			else return mapData
		}))
		res.send(allData);
	} catch (err) {
		res.status(500).send({ message: err.message || "Some error occurred while retrieving tutorials." });
	};
};


//Find a single Tutorial with an id:
exports.findOne = (req, res) => {
	const id = req.params.id;

	Tutorial.findById(id)
		.then(data => {
			if (!data)
				res.status(404).send({ message: "Not found Tutorial with id " + id });
			else res.send(data);
		})
		.catch(err => {
			res
				.status(500)
				.send({ message: "Error retrieving Tutorial with id=" + id });
		});
};


//Update a Tutorial identified by the id in the request:
exports.update = (req, res) => {
	if (!req.body) {
		return res.status(400).send({
			message: "Data to update can not be empty!"
		});
	}

	const id = req.params.id;

	Tutorial.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
		.then(data => {
			if (!data) {
				res.status(404).send({
					message: `Cannot update Invoice with id=${id}. Maybe Invoice was not found!`
				});
			} else res.send({ message: `Invoice ${req.body.invoiceId} was updated successfully. ` });
		})
		.catch(err => {
			res.status(500).send({
				message: "Error updating Invoice with id=" + id
			});
		});
};


//Update an invoice identified by the company, yaer and invoice_id in the body:
exports.updateExcelRecID = (req, res) => {
	if (!req.body) {
		return res.status(400).send({
			message: "Data to update can not be empty!"
		});
	}
	Tutorial.findOneAndUpdate({
		company: req.body.company,
		year: req.body.year,
		invoiceId: req.body.invoiceId
	},
		{ excelRecID: req.body.excelRecID })
		.then(data => {
			if (!data) {
				res.status(400).send({
					message: `Cannot update invoice with invoiceId=${req.body.invoiceId}. Maybe invoice was not found!`
				});
			} else res.send({ message: "Invoice was updated successfully." });
		})
		.catch(err => {
			res.status(500).send({
				message: "Error updating Invoice with imvoiceId=" + req.body.invoiceId
			});
		});
};


//Delete a Tutorial with the specified id:
exports.delete = (req, res) => {
	const id = req.params.id;

	Tutorial.findByIdAndRemove(id)
		.then(data => {
			if (!data) {
				res.status(404).send({
					message: `Cannot delete Tutorial with id=${id}. Maybe Tutorial was not found!`
				});
			} else {
				res.send({
					message: "Tutorial was deleted successfully!"
				});
			}
		})
		.catch(err => {
			res.status(500).send({
				message: "Could not delete Tutorial with id=" + id
			});
		});
};


//Delete all Tutorials from the database:
exports.deleteAll = (req, res) => {
	Tutorial.deleteMany({})
		.then(data => {
			res.send({
				message: `${data.deletedCount} Tutorials were deleted successfully!`
			});
		})
		.catch(err => {
			res.status(500).send({
				message:
					err.message || "Some error occurred while removing all tutorials."
			});
		});
};


//Find all Tutorials with published = true:
exports.findAllPublished = (req, res) => {
	Tutorial.find({ published: true })
		.then(data => {
			res.send(data);
		})
		.catch(err => {
			res.status(500).send({
				message:
					err.message || "Some error occurred while retrieving tutorials."
			});
		});
};


//Save bulk of invoices in the body:
exports.saveBulk = async (req, res) => {
	//console.log(req.body)
	if (!req.body) {
		return res.status(400).send({
			message: "Data of bulk to update can not be empty!"
		});
	}

	try {
		let data= await csv().fromFile(`uploads/${req.file.filename}`);
		data = data.map(item => item.published === 'T' ? {...item,published: true} : {...item,published: false});
		if (data) {
			const result = await Tutorial.insertMany(data, {ordered: true});
			unLinkFile(`uploads/${req.file.filename}`);
			if (result) {
				return res.send({
					hasErrors: false,
					message: "Data successfully Imported"
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

function unLinkFile(path) {
	fs.unlinkSync(path);
}

function getMappedItems(filteredData) {
	const data = filteredData.map((item, i) => {
		return {
			company: item['Company '] && item['Company '].replace(/\s+/g, ''),
			project: item['Project '] && item['Project '].replace(/\s+/g, ''),
			description: item['Description '] && item['Description '].replace(/\s+/g, ''),
			published: item['published '],
			amount: item['Amount '],
			vat: item['Vat '],
			total: item['Total '],
			group: item['GroupID '],
			date: item['InvDate '],
			supplier: item['supplier '] && item['supplier '].replace(/\s+/g, ''),
			invoiceId: item['invoiceID '],
			remark: item['Remark '],
			excelRecID: item['ExcelRecordID  '],
			year: item['Year '],
		}
	});
	return data;
}