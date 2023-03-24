const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.invoices = require("./invoice.model.js")(mongoose);
db.books = require("./book.model.js")(mongoose);
db.tables = require("./table.model.js")(mongoose);
db.revenues = require("./revenue.model.js")(mongoose);

module.exports = db; 