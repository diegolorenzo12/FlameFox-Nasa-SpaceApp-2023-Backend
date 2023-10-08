const mongoose = require("mongoose");

const pointSchema = new mongoose.Schema({
    type:{
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates:{
        type: [Number],
        required: true
    }
})

const reportSchema = new mongoose.Schema({
    location:{
        type: pointSchema,
        required: true
    },
    imageUrl: {
        type: String,
        required: true,
    },
    imageName: {
        type: String,
        required: true,
    },
    //Calculated fields
    confidenceScore: {
        type: Number,
    },
    
    brightness: {
        type: Number,
    },
});

reportSchema.index({location: "2dsphere"})
module.exports = mongoose.model("Report", reportSchema);
