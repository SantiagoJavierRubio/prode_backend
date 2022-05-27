import CustomError from './CustomError.js'

const errorHandler = (err, req, res, next) => {
    if (res.headersSent || !(err instanceof CustomError)) return next(err)
    console.log(err)
    return res.status(err.status).json({
        error: err.message,
        details: err.details
    })
}

export default errorHandler