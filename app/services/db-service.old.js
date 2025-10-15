// exports.getSingleItem = async (model,query) => {
//     try {
//         return await model.findOne(query);
//     } catch (error) {
//         console.log(error)
//         throw error;
//     }
// },
// exports.getMultipleItems = async (model,query) => {
//     try {
//         return await model.find(query).lean();
//     } catch (error) {
//         console.log(error)
//         throw error;
//     }
// },
exports.getEntities = async ({ model, filter }) => {
	if (!model) throw new Error("Model is required");

	// הפעלת lean לשיפור ביצועים
	const data = await model.find(filter).lean();

	// אם יש רק רשומה אחת — החזר אותה כאובייקט
	if (data.length === 1) return data[0];
	return data;
};
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
