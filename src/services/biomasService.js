const axios = require("axios");
const sharp = require("sharp");
const cheerio = require("cheerio");

const TOP_LAT = 90;
const LEFT_LON = -179.5;
var LatestEVIImage = null;

const getImageUrl = () => {
  //should change the image every day
  return "https://e4ftl01.cr.usgs.gov/MOLT/MOD13C1.061/2023.09.14/BROWSE.MOD13C1.A2023257.061.2023274052009.1.jpg";
};

async function findLatestEVIImageUrl(maxDaysToLookBack = 50) {
  if (LatestEVIImage) {
    return LatestEVIImage;
  }
  const baseUrl = "https://e4ftl01.cr.usgs.gov/MOLT/MOD13C1.061/";

  try {
    const currentDate = new Date();

    // Iterate through previous days
    for (let daysAgo = 0; daysAgo <= maxDaysToLookBack; daysAgo++) {
      const previousDate = new Date(currentDate);
      previousDate.setDate(currentDate.getDate() - daysAgo);

      const year = previousDate.getUTCFullYear();
      const month = (previousDate.getUTCMonth() + 1)
        .toString()
        .padStart(2, "0");
      const day = previousDate.getUTCDate().toString().padStart(2, "0");
      const currentDateStr = `${year}.${month}.${day}`;

      const imageUrl = `${baseUrl}${currentDateStr}/`;
      try {
        const response = await axios.head(imageUrl);

        if (response.status === 200) {
          const htmlResponse = await axios.get(imageUrl);

          const $ = cheerio.load(htmlResponse.data);
          const imageLink = $('a[href$=".jpg"]').attr("href");

          if (imageLink) {
            const completeImageUrl = `${imageUrl}${imageLink}`;
            LatestEVIImage = completeImageUrl;
            return completeImageUrl;
          } else {
            throw new Error("Image link not found in the directory listing.");
          }
        }
      } catch (err) {}
    }

    throw new Error(
      "No valid images found in the last " + maxDaysToLookBack + " days."
    );
  } catch (error) {
    throw new Error("Error finding the latest image URL: " + error.message);
  }
}

// Usage example:
findLatestEVIImageUrl()
  .then((latestImageUrl) => {
    console.log("Latest EVI Image URL:", latestImageUrl);
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });

const findClosestColor = (r, g, b, colorMapping) => {
  let minDistance = Infinity;
  let closestColor = null;

  for (const colorStr in colorMapping) {
    const [r2, g2, b2] = colorStr.split(",").map(Number);
    const distance = Math.sqrt(
      Math.pow(r2 - r, 2) + Math.pow(g2 - g, 2) + Math.pow(b2 - b, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestColor = colorStr;
    }
  }

  return colorMapping[closestColor];
};

const getColorMapping = async () => {
  try {
    const response = await axios.get(getImageUrl(), {
      responseType: "arraybuffer",
    });
    const imageBuffer = Buffer.from(response.data, "binary");

    // Extract the color scale from the image
    const scaleImage = await sharp(imageBuffer)
      .extract({ left: 3100, top: 3633, width: 980, height: 37 })
      .png() // Convert to PNG format
      .toBuffer();

    // Map colors to values
    const numIntervals = 20; // Number of intervals
    const intervalWidth = 980 / numIntervals; // Width of each interval

    // Map colors to values
    const colorMapping = {};
    for (let interval = 0; interval < numIntervals; interval++) {
      let rSum = 0,
        gSum = 0,
        bSum = 0;
      let count = 0;

      for (
        let i = 3 * interval * intervalWidth;
        i < 3 * (interval + 1) * intervalWidth;
        i += 3
      ) {
        rSum += scaleImage[i];
        gSum += scaleImage[i + 1];
        bSum += scaleImage[i + 2];
        count++;
      }

      // Compute average color
      const rAvg = Math.round(rSum / count);
      const gAvg = Math.round(gSum / count);
      const bAvg = Math.round(bSum / count);

      const color = `${rAvg},${gAvg},${bAvg}`;
      const value = interval / (numIntervals - 1); // Normalized to [0, 1]

      colorMapping[color] = value;
    }
    return colorMapping;
  } catch (error) {
    console.error("Error fetching or processing the image:", error);
    throw error;
  }
};

const getEviValues = async (lat, lon) => {
  const row = Math.round((TOP_LAT - lat) / 0.05);
  const col = Math.round((lon - LEFT_LON) / 0.05);

  if (row < 0 || row >= 3600 || col < 0 || col >= 7200) {
    return 0;
  }

  try {
    // Fetch the image from the URL
    const response = await axios.get(getImageUrl(), {
      responseType: "arraybuffer",
    });
    const imageBuffer = Buffer.from(response.data, "binary");

    const colorMapping = await getColorMapping(imageBuffer);

    const { data } = await sharp(imageBuffer)
      .extract({ left: col, top: row, width: 1, height: 1 })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const [r, g, b] = data;
    const evi = findClosestColor(r, g, b, colorMapping);

    return evi;
  } catch (error) {
    console.error(error);
    return 0;
  }
};

const getBiomas = async (lat, lon) => {
  const evi = await getEviValues(lat, lon);
  return 151.7 * evi - 39.76;
};

module.exports = {
  getBiomas,
};
