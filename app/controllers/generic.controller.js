const db = require("../models");
var fs = require('fs');
const csv = require('csvtojson');
const dbService = require("../services/db-service");
const { google } = require('googleapis');
const googleService = require('../services/google-service');

//Create and Save a new entity:
exports.create = async (req, res) => {
	try {
		const  updatePayload = await createUpdate(req);

		const data = await dbService.createItem(db[req.query.model], updatePayload);
		if (data) {
			res.send(data);
		}
	} catch (error) {
		console.log(error);
		res.status(500).send({message: error.message || "Some error occurred while retrieving entity."});
	}
};

exports.findAll = async (req, res) => {
	try {
		const query = {... req.query};
		const model = req.query.model;
		delete query.model;
		return res.send(await dbService.getMultipleItems(db[model], req.query));
	} catch (error) {
		res.status(500).send({message: error.message || "Some error occurred while retrieving entity."});		
	}
};


//Find a single entity with an id:
exports.findOne = async (req, res) => {
	try {
		const id = req.params.id;
		return res.send(await dbService.getSingleItem(db[req.query.model], {_id: id}));
	} catch (error) {
		res.status(500).send({ message: "Error retrieving entity!"});		
	}
};

//Find a single entity with specific field(s) in the req.query
exports.getOne = async (req, res) => {
	try {
		let modelName = req.query.model;
		delete req.query.model
		return res.send(await dbService.getSingleItem(db[modelName], req.query));
	} catch (error) {
		res.status(500).send({ message: "Error retrieving entity!"});		
	}
};

//Update a entity identified by the id in the request:
exports.update = async (req, res) => {
    try {
        
        const id = req.params.id;
        
        const  updatePayload = await createUpdate(req);
	    
        const updatedEntity = await dbService.updateItem(db[req.query.model], { _id: id }, updatePayload);


        if (!updatedEntity) {
            return res.status(404).send({ message: `Cannot update entity with id=${id}. Entity not found!` });
        }

        res.send({ message: 'Entity updated successfully.' });
    } catch (error) {
        console.error('Error updating entity:', error);
        res.status(500).send({ message: `Error updating entity: ${error.message}` });
    }
};


//Delete a entity with the specified id:
exports.delete = async (req, res) => {
	try {
		const id = req.query.id;
		const data = await dbService.deleteItem(db[req.query.model], {_id: id});
		if(data) {
			res.send({ message: "entity was updated successfully." });
		} else {
			res.status(404).send({message: `Cannot delete entity with id=${id}. Maybe entity was not found!`});
		}
	} catch (error) {
		res.status(500).send({ message: "Error updating entity!"});		
	}
};


//Delete all records with specified year - if year not specified - delete all data from the database:
exports.deleteAll = async (req, res) => {
	try {
		const query = {... req.query};
		const model = req.query.model;
		delete query.model;

		const data = await dbService.deleteMany(db[model], query);
		if(data) {
			res.send({
				message: `${data.deletedCount} data were deleted successfully!`
			});
		}
	} catch (error) {
		res.status(500).send({
			message:
				err.message || "Some error occurred while removing all data."
		});
	}
};

exports.findOneAndUpdate = async (req, res) => {
	try {
		const model = req.query.model;
		delete req.query.model;
		return res.send(await dbService.updateItem(db[model], req.query, req.body));
	} catch (error) {
		res.status(500).send({message: error.message || "Some error occurred while retrieving entity."});		
	}
};

async function createUpdate(req){

		const file = req.file;
        const {year,group,invoiceId} = req.body;
        let updatePayload = {};
        
        if(file){
	       
	        if (!file) {
	            return res.status(400).send({ message: 'No file uploaded!' });
	        }

	        
	        let path = `${group}`;
	        
	        const auth = googleService.getAuth();
	        const uploadedFile = await googleService.uploadToGoogleDrive(auth, file.filename,path);

	        if (!uploadedFile || !uploadedFile.id) {
	            return res.status(500).send({ message: 'Failed to upload the file to Google Drive!' });
	        }
	       
	        fs.unlinkSync(`uploads/${file.filename}`);
	        
	        updatePayload = {
	            ...req.body,
	            link: uploadedFile.url, 
	        };
	    }else{
	    	 updatePayload = req.body;
	    }

	    if(updatePayload.payments){
	    	updatePayload.payments = JSON.parse(updatePayload.payments);
	    }

	    return updatePayload;
}


