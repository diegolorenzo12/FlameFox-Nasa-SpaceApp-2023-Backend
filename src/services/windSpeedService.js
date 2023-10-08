require("dotenv").config();
const axios = require("axios");

const getWindSpeed = async (lat, lot) => {
  const apiKey = process.env.AZURE_MAPS_KEY;
  if (apiKey)
    try {
      const request = await axios.get(
        `https://atlas.microsoft.com/weather/currentConditions/json?api-version=1.1&query=${lat},${lot}&subscription-key=${apiKey}`
      );
      return await request.data.results[0].wind.speed.value; //in km
    } catch (err) {
      console.log(err);
    }
};

module.exports = {
  getWindSpeed,
};
