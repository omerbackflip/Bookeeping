//    When a client sends request for an endpoint using HTTP request (GET, POST, PUT, DELETE), 
//    we need to determine how the server will reponse by setting up the routes.

//    These are our routes:

//    /api/Invoices: GET, POST, DELETE
//    /api/Invoices/:id: GET, PUT, DELETE
//    /api/Invoices/published: GET
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

module.exports = app => {
  const Invoices = require("../controllers/invoice.controller.js");

  var router = require("express").Router();

  // Update an invoice with Excel_Rec_ID
  router.put("/update-records", Invoices.updateExcelRecID);
  
  // Save Bulk of invoices
  router.post("/save-bulk",upload.single('file'), Invoices.saveBulk);
  
  // Create a new Invoice
  router.post("/", Invoices.create);

  // Retrieve all Invoices
  router.get("/", Invoices.findAll);

  // Retrieve all published Invoices
  router.get("/published", Invoices.findAllPublished);

  // Retrieve a single Invoice with id
  router.get("/:id", Invoices.findOne);

  // Update a Invoice with id
  router.put("/:id", Invoices.update);

  // Delete a Invoice with id
  router.delete("/:id", Invoices.delete);

  // Delete all Invoices
  router.delete("/", Invoices.deleteAll);


  app.use('/api/Invoices', router);
};