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
    const minConfidence = typeof req.query.confidence !== "undefined" ? req.query.confidence : 0.65;
    const body = req.body;
    try{
        let reports = null
        //Sorty by Geo-data
        if(typeof(body.longitude) !== "undefined" && typeof(body.latitude) !== "undefined"){
            await Report.find({
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [body.longitude, body.latitude],
                        },
                    },
                },
                confidenceScore : {$gte : minConfidence}
            });
        }
        //Just filter out untrustworthy images
        else{
            reports = await Report.find({
                confidenceScore : {$gte : minConfidence}
            })
        }
        
        
        
        //This doesn't work
        //reports = await reports.find({confidenceScore: {$gte: minConfidence}})
        
        //SQL ""Equivalent""":
        //select * from reports where confidence > minConfidence and nearest(location) order by location asc
        
        const totalPages = Math.ceil(reports.length / webserviceCfg.RESOURCE_PER_PAGE);
        res.set("X-Total-Pages", totalPages);
        res.set("X-Total-Records", reports.length);
        
        const lowerSliceBound = page * webserviceCfg.RESOURCE_PER_PAGE;
        const upperSliceBound = lowerSliceBound + webserviceCfg.RESOURCE_PER_PAGE;
        
        if (lowerSliceBound < reports.length) {
            return res.json(reports.slice(lowerSliceBound, upperSliceBound));
        } else {
            return res.json(reports.slice(-webserviceCfg.RESOURCE_PER_PAGE));
        }
    }catch(err){
        console.log(err.message)
        next(err)
    }
});
    
reportRouter.post("/", async (req, res, next) => {
    try{
        const body = req.body;
        
        //TODO: Validate the URL belongs points to FlameFox CDN
        //HUUUUUUUUUGE security risk O_O
        const imgData = await axios.get(body.imageId, { responseType: 'arraybuffer' })
        const imgBuffer = Buffer.from(imgData.data)
       
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
            imageUrl: body.imageId,
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
