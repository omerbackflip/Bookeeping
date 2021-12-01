const db = require("../models");
const Book = db.books;

//Create and Save a new Book:
exports.create = (req, res) => {
  // Validate request
  if (!req.body.asmchta_date) {
    res.status(400).send({ message: "'asmchta_date' field can not be empty!" });
    return;
  }

  // Create a Book
  const book = new Book({
    company:        req.body.company,
    asmchta_date:   req.body.asmchta_date,
    record_id:      req.body.record_id,
    record_schum:   req.body.record_schum,
    pratim:         req.body.pratim,
    asmacta1:       req.body.asmacta1,
    schum_hova:     req.body.schum_hova,
    schum_zchut:    req.body.schum_zchut,
    cust_lname:     req.body.cust_lname,
    cust_fname:     req.body.cust_fname,
    bs_item_name:   req.body.bs_item_name,
    bs_group_name:  req.body.bs_group_name,
  });

  // Save Book in the database
  book
    .save(book)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Book."
      });
    });
};


//Retrieve all Books/ find by title from the database:
//We use req.query.title to get query string from the Request and consider it as condition for findAll() method.
//Eli Gadot - change the search from title to description 
//also change in TutorialDataService from /books?title to /books?description)
exports.findAll = (req, res) => {
  const search = req.query.description;
  var condition = search ? { description: { $regex: new RegExp(search), $options: "i" } } : {};

  Book.find(condition)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving books."
      });
    });
};


//Find a single Book with an id:
exports.findOne = (req, res) => {
  const id = req.params.id;

  Book.findById(id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found Book with id " + id });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving Book with id=" + id });
    });
};


//Update a Book identified by the id in the request:
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;

  Book.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Book with id=${id}. Maybe Book was not found!`
        });
      } else res.send({ message: "Book was updated successfully." });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Book with id=" + id
      });
    });
};


//Delete a Book with the specified id:
exports.delete = (req, res) => {
  const id = req.params.id;

  Book.findByIdAndRemove(id)
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Book with id=${id}. Maybe Book was not found!`
        });
      } else {
        res.send({
          message: "Book was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Book with id=" + id
      });
    });
};


//Delete all Books from the database:
exports.deleteAll = (req, res) => {
  Book.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount} Books were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all books."
      });
    });
};


//Find all Books with published = true:
exports.findAllPublished = (req, res) => {
  Book.find({ published: true })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving books."
      });
    });
};