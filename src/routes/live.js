const liveRouter = require('express').Router()
const fetchFireData = require('../services/fireService')
const webserviceCfg = require('../configs/ws')

liveRouter.get('/', async (req, res, next)=>{
    try{
        const body = req.body
        const page = typeof(req.query.page) !== 'undefined' ? req.query.page : 0
        const fireData = await fetchFireData('world')
        const lowerSliceBound = page*webserviceCfg.RESOURCE_PER_PAGE
        const upperSliceBound = lowerSliceBound +  webserviceCfg.RESOURCE_PER_PAGE
        res.append("X-Total-Pages", Math.ceil(fireData.length/webserviceCfg.RESOURCE_PER_PAGE))
        res.append("X-Total-Records", fireData.length)
        
        if(lowerSliceBound < fireData.length){
            return res.json(fireData.slice(lowerSliceBound, upperSliceBound))
        }else{
            return res.json(fireData.slice(-webserviceCfg.RESOURCE_PER_PAGE))
        }

    }catch(err){
        next(err)
    }
    
})

module.exports = liveRouter