const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

// Save Bulk of Specific
module.exports = app => {
  const specific = require("../controllers/specific.controller.js");

  var router = require("express").Router();

  router.post("/save-invoices-bulk",upload.single('file'), specific.saveInvoicesBulk);
  router.post("/save-books-bulk",upload.single('file') , specific.saveBooksBulk);

  app.use('/api/specific', router);
};