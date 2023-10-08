const reportRouter = require("express").Router();
const Report = require("../models/report");
const multer = require("multer");
const containerClient = require("../utils/containerClient");
const { v4: uuidv4 } = require("uuid");
const webserviceCfg = require("../configs/ws")

reportRouter.get("/", async (req, res, next) =>{
    const page = typeof(req.query.page) !== 'undefined' ? req.query.page : 0
    const body = req.body;
    
    const reports = await Report.find({
        location:{
            $near : {
                $geometry:{
                    type: "Point",
                    coordinates: [body.longitude, body.latitude]
                }
            }
        }
    })

    const totalPages = Math.ceil(reports.length / webserviceCfg.RESOURCE_PER_PAGE)
    res.set('X-Total-Pages', totalPages)
    res.set('X-Total-Records', reports.length)
    
    const lowerSliceBound = page*webserviceCfg.RESOURCE_PER_PAGE
    const upperSliceBound = lowerSliceBound +  webserviceCfg.RESOURCE_PER_PAGE
    
    if(lowerSliceBound < reports.length){
        return res.json(reports.slice(lowerSliceBound, upperSliceBound))
    }else{
        return res.json(reports.slice(-webserviceCfg.RESOURCE_PER_PAGE))
    }


})

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
            
            // Create a new report
            const report = new Report({
                location: {
                    type: "Point",
                    coordinates: [ body.longitude, body.latitude]
                },
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
    