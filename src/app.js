const mongoose = require('mongoose')
const express = require('express');

//Database Configuration
const databaseCfg = require('./configs/db');

const app = express()


mongoose.connect(databaseCfg.ATLAS_URL).then(()=>{
    console.log("The database has been connected succesfully")
}).catch((err)=>{
    console.log("Failed to connect " + err.message)
})



module.exports = app