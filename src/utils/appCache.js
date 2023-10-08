const NodeCache = require("node-cache")
const appCache = new NodeCache({stdTTL:540})


module.exports = appCache
