const multer = require("multer");
const upload = multer({ dest: "uploads/" }); 
module.exports = app => {
	const generic = require("../controllers/generic.controller.js");

	var router = require("express").Router();

	// Create entity
	router.post("/create",upload.single('file'), generic.create);

	// Retrieve all entity
	router.get("/get-list", generic.findAll);

	// Retrieve one entity
	router.get("/get-one", generic.getOne);

	// Retrieve a single entity with id
	router.get("/get-by-id/:id", generic.findOne);

	// Delete a single entity with id
	router.delete("/delete", generic.delete);

	// Update an entity with id
	router.post("/update/:id",upload.single('file'), generic.update);

	// Update an entity with id
	router.put("/find-one-and-update", generic.findOneAndUpdate);

	// Delete all generic
	router.delete("/delete-all", generic.deleteAll);

	app.use('/api/generic', router);
};