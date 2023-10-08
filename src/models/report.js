const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  longitude: {
    type: String,
    required: true,
  },
  latitude: {
    type: String,
    required: true,
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

module.exports = mongoose.model("Report", reportSchema);
