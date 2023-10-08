const windSpeedService = require("./windSpeedService");
const biomassService = require("./biomasService");

const getRateOfSpread = async (lat, lot) => {
  const speed = await windSpeedService.getWindSpeed(lat, lot);
  const biomass = await biomassService.getBiomas(lat, lot);
  return 0.07 * biomass + 0.1 * speed;
};
//10% Wind Speed Rule of Thumb
//asuming a ton of carbon increases the rate of fire spread by 0.07 km/h

module.exports = {
  getRateOfSpread,
};
