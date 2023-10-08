const liveRouter = require('express').Router()

liveRouter.get('/', async (req, res)=>{
    res.send("Pong!")
})