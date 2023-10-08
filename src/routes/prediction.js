const predictionRouter = require("express").Router();
const rateOfSpreadService = require("../services/rateOfSpreadService");

predictionRouter.get("/fire_rate", async (req, res, next) => {
  const lat = req.query.latitude;
  const lot = req.query.longitude;
  if (!lat || !lot) {
    return res.json({ message: "provide all parameters" });
  }
  try {
    const rate = await rateOfSpreadService.getRateOfSpread(lat, lot);
    return res.json({ data: rate });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err });
  }
});

module.exports = predictionRouter;
