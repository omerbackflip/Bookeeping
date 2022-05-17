//    When a client sends request for an endpoint using HTTP request (GET, POST, PUT, DELETE), we need to determine how the server will reponse by setting up the routes.

//    These are our routes:

//    /api/books: GET, POST, DELETE
//    /api/books/:id: GET, PUT, DELETE
//    /api/books/published: GET

const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

module.exports = app => {
  const books = require("../controllers/book.controller.js");

  var router = require("express").Router();
  
  // Save Bulk of invoices
  router.post("/save-bulk",upload.single('file') , books.saveBulk);
  
  // Create a new Book
  router.post("/", books.create);

  // Retrieve all Books
  router.get("/", books.findAll);

  // Retrieve all published Books
  router.get("/published", books.findAllPublished);

  // Retrieve a single Book with id
  router.get("/:id", books.findOne);

  // Update a Book with id
  router.put("/:id", books.update);

  // Delete a Book with id
  router.delete("/:id", books.delete);

  // Delete all Books
  router.delete("/", books.deleteAll);

  app.use('/api/books', router);
};