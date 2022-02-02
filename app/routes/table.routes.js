//    When a client sends request for an endpoint using HTTP request (GET, POST, PUT, DELETE), we need to determine how the server will reponse by setting up the routes.

//    These are our routes:

//    /api/tables: GET, POST, DELETE
//    /api/tables/:id: GET, PUT, DELETE
//    /api/tables/published: GET


module.exports = app => {
  const tables = require("../controllers/table.controller.js");

  var router = require("express").Router();

  // Create a new Table
  router.post("/", tables.create);

  // Retrieve all Tables
  router.get("/", tables.findAll);

  // Retrieve all published Tables
  router.get("/published", tables.findAllPublished);

  // Retrieve a single Table with id
  router.get("/:id", tables.findOne);

  // Update a Table with id
  router.put("/:id", tables.update);

  // Delete a Table with id
  router.delete("/:id", tables.delete);

  // Delete all Tables
  router.delete("/", tables.deleteAll);

  app.use('/api/tables', router);
};