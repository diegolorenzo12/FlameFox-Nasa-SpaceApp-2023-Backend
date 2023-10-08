const mongoose = require('mongoose')

const reportSchema = new mongoose.Schema({
    longitude:{
        type: String,
        required: true
    },
    lattitude:{
        type: String,
        required: true
    },
    images :{
        type: [String],
        require: true
    },

    //Calculated fields
    confidenceScore: {
        type: Number
    },

    brightness: {
        type: Number
    }
})

const Report = new mongoose.Schema(reportSchema)