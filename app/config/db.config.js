// In the app folder, we create a separate config folder for configuration
// with db.config.js file like this:

// module.exports = {
//   url: "mongodb://localhost:27017/bookeeping"
//   // url: "mongodb+srv://eli:dg76jqRdOKa0Czlu@cluster0.l0i9tnp.mongodb.net/booking?retryWrites=true&w=majority"
// };

module.exports = {
  url: process.env.DB_CONNECTION_STRING,
  version: process.env.VERSION_ID,
};
