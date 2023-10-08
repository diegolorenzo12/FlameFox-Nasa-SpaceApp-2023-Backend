const errorHandler = (err, req, res, next) =>{
    console.error(err.message)
    if(err.name === 'ValidationError'){
        return res.status(400).json({
            error: err.name,
            details: err.message
        })
    }else if(err.name === 'AxiosError'){
        return res.status(500).json({
            error: err.name,
            details: err.message
        })
    }

    next(err)
}

module.exports = errorHandler