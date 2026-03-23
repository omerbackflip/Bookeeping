require('dotenv').config(); // Load environment variables from .env file
const { createGoogleRouter, createFileTokenStore } = require('./google/backend');
const path = require('path');
const express = require("express");
const cors = require("cors");

const app = express();

// var corsOptions = {
//   origin: "http://localhost:8081"
// };

app.use(cors());

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const tokenStore = createFileTokenStore(
  path.join(__dirname, 'app/config/token.json')
);

app.use('/api/google', createGoogleRouter({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
  scopes: process.env.GOOGLE_SCOPES,
  tokenStore
}));


// Don’t forget to call connect() method in server.js (here, this file):
const db = require("./app/models");

db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });


// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

require("./app/routes/specific.routes")(app);
// require("./app/routes/generic.routes")(app);
// ✅ New: Use shared mongoose submodule router
const mongooseRouter = require("./app/shared/mongoose/routes/generic.routes");
app.use("/api/generic", mongooseRouter);


// set port, listen for requests
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});