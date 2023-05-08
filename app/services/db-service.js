exports.getSingleItem = async (model,query) => {
    try {
        return await model.findOne(query);
    } catch (error) {
        console.log(error)
        throw error;
    }
},
exports.getMultipleItems = async (model,query) => {
    try {
        return await model.find(query).lean();
    } catch (error) {
        console.log(error)
        throw error;
    }
},
exports.updateItem = async (model,query,paylod) => {
    try {
        return await model.findOneAndUpdate(query,paylod);
    } catch (error) {
        console.log(error)
        throw error;
    }
},
exports.createItem = async (model,payload) => {
    try {
        return await model.create(payload);
    } catch (error) {
        console.log(error)
        throw error;
    }
},
exports.deleteItem = async (model,query) => {
    try {
        return await model.deleteMany(query);
    } catch (error) {
        console.log(error)
        throw error;
    }
},
exports.deleteMany = async (model,query) => {
    try {
        return await model.deleteMany(query);
    } catch (error) {
        console.log(error)
        throw error;
    }
}