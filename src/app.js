const mongoose = require("mongoose");
const express = require("express");
const morgan = require("morgan");
const errorHandler = require("./middlewares/error_handler");

//Database Configuration
const databaseCfg = require("./configs/db");

mongoose
  .connect(databaseCfg.ATLAS_URL)
  .then(() => {
    console.log("The database has been connected succesfully");
  })
  .catch((err) => {
    console.log("Failed to connect " + err.message);
  });

//Endpoints
const reportRouter = require("./routes/report");
const liveRouter = require("./routes/live");
const predictionRouter = require("./routes/prediction");
const bodyParser = require("body-parser");

const app = express();
morgan.token("body", function (req) {
  return JSON.stringify(req.body);
});

//Middleware
app.use(bodyParser.json({ limit: "25mb" }));
app.use(express.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

//Route middleware
app.use("/api/report", reportRouter);
app.use("/api/live", liveRouter);
app.use("/api/prediction", predictionRouter);

//Error handling
app.use(errorHandler);

module.exports = app;
