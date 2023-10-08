const liveRouter = require('express').Router()

liveRouter.get('/', async (req, res)=>{
    const body = req.body
    res.append("X-Total-Pages")
    res.send(req.query.page)    
})

module.exports = liveRouter