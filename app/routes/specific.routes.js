const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

// Save Bulk of Specific
module.exports = app => {
  const specific = require("../controllers/specific.controller.js");

  var router = require("express").Router();

  router.post("/save-invoices-bulk",upload.single('file'), specific.saveInvoicesBulk1);
  router.post("/save-books-bulk",upload.single('file') , specific.saveBooksBulk1);
  router.post("/save-revenues-bulk",upload.single('file') , specific.saveRevenuesBulk);
  router.post("/upload-to-google-drive",upload.single('file') , specific.uploadInvoicesToGoogleDrive)
  router.post("/batch-book-invoice", specific.batchBooksInvoices);
  router.post("/batch-invoice-book", specific.batchInvoicesBooks);
  router.post("/batch-clear-ExcelRecID", specific.batchClearExcelRecID);
  // router.put("/add-payments-to-invoice/:invoiceId", specific.addPaymentsToInvoice); // not in used
  router.put("/update-payment-in-invoice/:objIdOfPayment", specific.updatePaymentInInvoice);
  router.get("/get-database-info", specific.getDbInfo);


  //Google auth  
  router.post("/upload-invoices-to-gdrive", specific.uploadInvoicesToGDrive);
  router.get("/get-google-connection-status", specific.googleConnectionStatus);
  router.get("/google-auth-handler", specific.googleAuthHandler);

  app.use('/api/specific', router);
};