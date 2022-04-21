const db = require("../models");
const Tutorial = db.tutorials;
const Book = db.books;

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
  const search = req.query.description;
  var condition = search ? { description: { $regex: new RegExp(search), $options: "i" } } : {};

  const data = await Tutorial.find(condition).lean();
  try{
    const allData = await Promise.all(data.map(async (mapData) =>{
      if(await Book.exists({company:mapData.company, record_id:mapData.excelRecID})) {
      // if(mapData.excelRecID) {
        const item = await Book.findOne({company:mapData.company, record_id:mapData.excelRecID});
        return {...mapData,
                    pratim: item.pratim,
                    record_schum:item.record_schum,
                    cust_lname:item.cust_lname,
                    cust_fname:item.cust_fname};
      } else return mapData
    }))
    res.send(allData);
  } catch(err){
      res.status(500).send({message: err.message || "Some error occurred while retrieving tutorials."});
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
          message: `Cannot update Tutorial with id=${id}. Maybe Tutorial was not found!`
        });
      } else res.send({ message: "Tutorial was updated successfully." });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Tutorial with id=" + id
      });
    });
};


//Update an invoice identified by the company and invoice_id in the request:
exports.updateExcelRecID = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }
  const company = req.body.company;
  const invoiceId = req.body.invoiceId;
  const excelRecID = req.body.excelRecID;
  Tutorial.findOneAndUpdate({company:company, invoiceId:invoiceId}, {excelRecID: excelRecID})
    .then(data => {
      if (!data) {
        res.status(400).send({
          message: `Cannot update invoice with invoiceId=${invoiceId}. Maybe invoice was not found!`
        });
      } else res.send({ message: "Invoice was updated successfully." });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Invoice with imvoiceId=" + invoiceId
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