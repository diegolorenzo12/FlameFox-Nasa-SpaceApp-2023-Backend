const mongoose = require('mongoose')

const reportSchema = new mongoose.Schema({
    longitude:{
        type: String,
        required: true
    },
    latitude:{
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

module.exports = mongoose.model('Report',reportSchema)