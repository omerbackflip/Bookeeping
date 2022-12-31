const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

// Save Bulk of Specific
module.exports = app => {
  const specific = require("../controllers/specific.controller.js");

  var router = require("express").Router();

  router.post("/save-invoices-bulk",upload.single('file'), specific.saveInvoicesBulk);
  router.post("/save-books-bulk",upload.single('file') , specific.saveBooksBulk);
  router.post("/batch-book-invoice", specific.batchBooksInvoices);
  router.post("/batch-clear-ExcelRecID", specific.batchClearExcelRecID);

  app.use('/api/specific', router);
};