const liveRouter = require('express').Router()
const fetchFireData = require('../services/fireService')
const webserviceCfg = require('../configs/ws')

liveRouter.get('/', async (req, res, next)=>{
    try{
        //Filters
        const body = req.body
        const page = typeof(req.query.page) !== 'undefined' ? Number(req.query.page) : 0
        const resourceLimit = typeof(req.query.limit) !== 'undefined' ? Number(req.query.limit) : webserviceCfg.RESOURCE_PER_PAGE
        
        const fireData = await fetchFireData('world')
        const lowerSliceBound = page * resourceLimit
        const upperSliceBound = lowerSliceBound +  resourceLimit
        console.log(`lower: ${lowerSliceBound}, upper: ${upperSliceBound}`)

        res.append("X-Total-Pages", Math.ceil(fireData.length/resourceLimit))
        res.append("X-Total-Records", fireData.length)
        
        if(lowerSliceBound < fireData.length){
            return res.json(fireData.slice(lowerSliceBound, upperSliceBound))
        }else{
            //Prevents getting an empty response when requesting
            //a page number higher than the total pages
            return res.json(fireData.slice(-resourceLimit))
        }

    }catch(err){
        next(err)
    }
    
})

module.exports = liveRouter