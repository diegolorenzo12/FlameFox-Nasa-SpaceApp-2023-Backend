const reportRouter = require('express').Router()
const Report = require('../models/report')


reportRouter.get('/', async (req, res)=>{
    res.send("Pong!")
})

reportRouter.post('/', async (req, res, next)=>{
    try{
        const body = req.body;
        const report = new Report({
            longitude: body.longitude,
            latitude: body.latitude,
            images: body.images, //TODO: Validate these images are actually from our CDN,
            confidenceScore: 0.0,
            brightness: null
        });
        
        await report.save()
        return res.json({
            status: "success",
            id: report._id
        })
    }catch(err){
        next(err)
    }
    
})

module.exports = reportRouter