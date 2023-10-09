const imageRouter = require("express").Router()
const containerClient = require('../utils/containerClient')
const {v4: uuidv4} = require("uuid")
const multer = require("multer")
const memStore = multer.memoryStorage()
const upload = multer({storage: memStore})


imageRouter.post("/", upload.single("file"), async(req, res) => {
    const blobName = `${Date.now()}-${uuidv4()}-${req.file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const uploadResponse = await blockBlobClient.upload(
      req.file.buffer,
      req.file.buffer.length
    );

    if (!uploadResponse.requestId || uploadResponse.error) {
        console.error("Error uploading file:", uploadResponse);
        return res.status(500).json({ error: "ImageUploadFailed", message: null});
    }

    return  res.json({
        status: "ok",
        resourceId: blobName
    })
})

module.exports = imageRouter