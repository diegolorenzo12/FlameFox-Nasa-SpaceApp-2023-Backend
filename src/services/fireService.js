const axios = require("axios");
const apiCfg = require("../configs/sciapi");
const appCache = require("../utils/appCache");
const converter = require("csvtojson");

const fetchFireData = async (area) => {
  const cacheKey = "cached-fire-data";
  cachedData = appCache.get(cacheKey);
  if (cachedData == undefined) {
    console.log("Cache miss. Requesting fresh data from FIRMS");
    try {
      const raw = await axios.get(
        `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${apiCfg.FIRMS_KEY}/VIIRS_SNPP_NRT/${area}/2`
      );
      const json = await converter().fromString(raw.data);
      appCache.set(cacheKey, json);
      return json;
    } catch (err) {
      console.log("error: " + err);
    }
  } else {
    console.log("Returning cached fire data: ");
    return cachedData;
  }
};

module.exports = fetchFireData;
