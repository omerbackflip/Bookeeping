const db = require("../models");
const Table = db.tables;

//Create and Save a new Table:
exports.create = (req, res) => {
  // Validate request
  if (!req.body.table_id) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  // Create a Table
  const table = new Table({
    table_id:     req.body.table_id,
    table_code:     req.body.table_code,
    description:  req.body.description,
  });

  // Save Table in the database
  table
    .save(table)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Table."
      });
    });
};


//Retrieve all Tables/ find by title from the database:
//We use req.query.title to get query string from the Request and consider it as condition for findAll() method.
//Eli Gadot - change the search from title to description 
//also change in TableDataService from /tables?title to /tables?description)
exports.findAll = (req, res) => {
  const search = req.query.description;
  var condition = search ? { description: { $regex: new RegExp(search), $options: "i" } } : {};

  Table.find(condition)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tables."
      });
    });
};


//Find a single Table with an id:
exports.findOne = (req, res) => {
  const id = req.params.id;

  Table.findById(id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found Table with id " + id });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving Table with id=" + id });
    });
};


//Update a Table identified by the id in the request:
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;

  Table.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Table with id=${id}. Maybe Table was not found!`
        });
      } else res.send({ message: "Table was updated successfully." });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Table with id=" + id
      });
    });
};


//Delete a Table with the specified id:
exports.delete = (req, res) => {
  const id = req.params.id;

  Table.findByIdAndRemove(id)
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Table with id=${id}. Maybe Table was not found!`
        });
      } else {
        res.send({
          message: "Table was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Table with id=" + id
      });
    });
};


//Delete all Tables from the database:
exports.deleteAll = (req, res) => {
  Table.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount} Tables were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all tables."
      });
    });
};


//Find all Tables with published = true:
exports.findAllPublished = (req, res) => {
  Table.find({ published: true })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tables."
      });
    });
};