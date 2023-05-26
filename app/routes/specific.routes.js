const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

// Save Bulk of Specific
module.exports = app => {
  const specific = require("../controllers/specific.controller.js");

  var router = require("express").Router();

  router.post("/save-invoices-bulk",upload.single('file'), specific.saveInvoicesBulk);
  router.post("/save-books-bulk",upload.single('file') , specific.saveBooksBulk);
  router.post("/save-revenues-bulk",upload.single('file') , specific.saveRevenuesBulk);
  router.post("/batch-book-invoice", specific.batchBooksInvoices);
  router.post("/batch-invoice-book", specific.batchInvoicesBooks);
  router.post("/batch-clear-ExcelRecID", specific.batchClearExcelRecID);
  router.put("/add-payments-to-invoice/:invoiceId", specific.addPaymentsToInvoice);
  router.get("/get-database-info", specific.getDbInfo);

  app.use('/api/specific', router);
};