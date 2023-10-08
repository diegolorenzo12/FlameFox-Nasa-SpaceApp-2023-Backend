const mongoose = require('mongoose')
const express = require('express');
const morgan = require('morgan')
const errorHandler = require('./middlewares/error_handler')
//Database Configuration
const databaseCfg = require('./configs/db');

//Endpoints
const reportRouter = require("./routes/report")


const app = express()
morgan.token('body', function (req) { return JSON.stringify(req.body) })


//Middleware
app.use(express.json())
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body"))

//Route middleware
app.use('/api/report', reportRouter)

//Error handling
app.use(errorHandler)

mongoose.connect(databaseCfg.ATLAS_URL).then(()=>{
    console.log("The database has been connected succesfully")
}).catch((err)=>{
    console.log("Failed to connect " + err.message)
})




module.exports = app