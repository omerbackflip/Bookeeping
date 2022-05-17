//    When a client sends request for an endpoint using HTTP request (GET, POST, PUT, DELETE), we need to determine how the server will reponse by setting up the routes.

//    These are our routes:

//    /api/tutorials: GET, POST, DELETE
//    /api/tutorials/:id: GET, PUT, DELETE
//    /api/tutorials/published: GET
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

module.exports = app => {
  const tutorials = require("../controllers/tutorial.controller.js");

  var router = require("express").Router();

  // Update an invoice with Excel_Rec_ID
  router.put("/update-records", tutorials.updateExcelRecID);
  
  // Save Bulk of invoices
  router.post("/save-bulk",upload.single('file'), tutorials.saveBulk);
  
  // Create a new Tutorial
  router.post("/", tutorials.create);

  // Retrieve all Tutorials
  router.get("/", tutorials.findAll);

  // Retrieve all published Tutorials
  router.get("/published", tutorials.findAllPublished);

  // Retrieve a single Tutorial with id
  router.get("/:id", tutorials.findOne);

  // Update a Tutorial with id
  router.put("/:id", tutorials.update);

  // Delete a Tutorial with id
  router.delete("/:id", tutorials.delete);

  // Delete all Tutorials
  router.delete("/", tutorials.deleteAll);


  app.use('/api/tutorials', router);
};