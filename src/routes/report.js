const reportRouter = require("express").Router();
const Report = require("../models/report");
const multer = require("multer");
const containerClient = require("../utils/containerClient");
const { v4: uuidv4 } = require("uuid");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

reportRouter.post("/", upload.single("image"), async (req, res, next) => {
    
    try{
        const body = req.body;
        //upload to azure blob storage
        const blobName = `${Date.now()}-${uuidv4()}-${req.file.originalname}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const uploadResponse = await blockBlobClient.upload(
            req.file.buffer,
            req.file.buffer.length
            );
            
            //check is upload succesfull
            if (!uploadResponse.requestId && uploadResponse.error) {
                console.error("Error uploading file:", uploadResponse);
                return res.status(400).json({ error: "Connection error" });
            }
            const imageUrl = blockBlobClient.url;
            console.log(imageUrl);
            
            // Create a new report
            const report = new Report({
                longitude: req.body.longitude,
                latitude: req.body.latitude,
                imageUrl: imageUrl,
                imageName: blobName,
                confidenceScore: 0.0,
                brightness: 1.0,
            });
            
            // Save the report to the database
            await report.save();
            res.status(201).json(report);
        } catch (err) {
            next(err)
        }
    });
    
    module.exports = reportRouter;
    