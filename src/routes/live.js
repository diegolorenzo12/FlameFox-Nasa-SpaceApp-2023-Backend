const liveRouter = require("express").Router();
const fetchFireData = require("../services/fireService");
const webserviceCfg = require("../configs/ws");

function getRandomElements(arr, count) {
  const shuffled = arr.slice(0);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

liveRouter.get("/", async (req, res, next) => {
  try {
    let limit = req.query.limit;
    if (!limit) {
      limit = 100;
    }
    const fireData = await fetchFireData("world");
    const shortFireData = fireData.map((item) => ({
      latitude: item.latitude,
      longitude: item.longitude,
      bright_ti5: item.bright_ti5,
    }));

    const randomFireData = getRandomElements(shortFireData, limit);
    return res.send(randomFireData);
  } catch (err) {
    next(err);
  }
});

module.exports = liveRouter;
