const errorHandler = (err, req, res, next) =>{
    console.error(err.message)
    
    //Error 400-499
    if(err.name === 'ValidationError'){
        return res.status(400).json({
            error: err.name,
            details: err.message
        })
    }else if(err.name == 'CastError'){
        return res.status(400).json({
            error: err.name,
            details: err.message
        })
    }
    //Error 500-599
    else if(err.name === 'AxiosError'){
        return res.status(500).json({
            error: err.name,
            details: err.message
        })
    }

    next(err)
}

module.exports = errorHandler