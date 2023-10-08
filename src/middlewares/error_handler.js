const errorHandler = (err, req, res, next) =>{
    console.error(err.message)
    if(err.name === 'ValidationError'){
        return res.status(400).json({
            status: "error",
            type: err.name,
            details: err.message
        })
    }

    next(err)
}

module.exports = errorHandler