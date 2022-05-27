const errorHandler = (err, req, res, next) => {
    if (res.headersSent) return next(err)
    return res.status(err.status).json({
        error: err.message,
        details: err.details
    })
}

export default errorHandler