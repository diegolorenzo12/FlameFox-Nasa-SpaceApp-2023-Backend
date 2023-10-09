const reportRouter = require("express").Router();
const Report = require("../models/report");
const multer = require("multer");
const containerClient = require("../utils/containerClient");
const { v4: uuidv4 } = require("uuid");
const webserviceCfg = require("../configs/ws")
const cloudCfg = require("../configs/cloud")
const axios = require("axios")

reportRouter.get("/", async (req, res, next) => {
    //If no confidence filter is specified, we ignore the confidence score alltogether
    const page = typeof req.query.page !== "undefined" ? req.query.page : 0;
    const minConfidence = typeof req.query.confidence !== "undefined" ? req.query.confidence : 0;
    const body = req.body;
    
    const reports = await Report.find({
        location: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [body.longitude, body.latitude],
                },
            },
        },
    });
    
    //This doesn't work
    //reports = await reports.find({confidenceScore: {$gte: minConfidence}})
    
    //SQL ""Equivalent""":
    //select * from reports where confidence > minConfidence and nearest(location) order by location asc
    
    const totalPages = Math.ceil(reports.length / webserviceCfg.RESOURCE_PER_PAGE);
    res.append("Access-Control-Expose-Headers", "X-Total-Pages, X-Total-Records")
    res.append("X-Total-Pages", totalPages);
    res.append("X-Total-Records", reports.length);
    
    const lowerSliceBound = page * webserviceCfg.RESOURCE_PER_PAGE;
    const upperSliceBound = lowerSliceBound + webserviceCfg.RESOURCE_PER_PAGE;
    
    if (lowerSliceBound < reports.length) {
        return res.json(reports.slice(lowerSliceBound, upperSliceBound));
    } else {
        return res.json(reports.slice(-webserviceCfg.RESOURCE_PER_PAGE));
    }
});
    
reportRouter.post("/", async (req, res, next) => {
    try{
        const body = req.body;
        
        //Upload to azure blob storage
        const blobName = `${Date.now()}-${uuidv4()}-${body.imageName}`;
        const imgBuffer = Buffer.from(body.imageData, "base64")
        
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const uploadResponse = await blockBlobClient.upload(imgBuffer,imgBuffer.length)
        
        //Check if the upload succesfull
        if (!uploadResponse.requestId || uploadResponse.error) {
            console.error("Error uploading file:", uploadResponse);
            return res.status(400).json({ error: "Blob upload error" });
        }
        const imageUrl = blockBlobClient.url;
        console.log(imageUrl);
        
        //Use ML to detect fire is present in the image
        const classifierRes = await axios.post(
            cloudCfg.CLASSIFIER_MODEL_URL,
            imgBuffer,
            {headers:{'Authorization' : `Bearer ${cloudCfg.HF_KEY}`}}
        )
            
        //Verify the server responded correction
        if(classifierRes.status != 200){
            return res.status(500).json({
                error : "VerificationServerNotAvailable",
                details: "The server resposible for handling image verifications couldn't be reached at this moment"
            })
        }
            
            
        const visualConfidenceScore = classifierRes.data.find((e)=>{return e["label"] === 'fire'})["score"]
            
        // Create a new report
        const report = new Report({
            location: {
                type: "Point",
                coordinates: [ body.longitude, body.latitude]
            },
            imageUrl: imageUrl,
            imageName: blobName,
            confidenceScore: visualConfidenceScore,
            brightness: null, //TODO: Calculate brightness?
        });
            
            // Save the report to the database
        await report.save();
        res.status(201).json(report);
    } catch (err) {
        next(err)
    }
});

reportRouter.get("/:id", async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }
        res.json(report);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = reportRouter;
