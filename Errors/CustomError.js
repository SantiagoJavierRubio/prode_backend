class CustomError {
    constructor(status, message, details, trace) {
        this.status = status || 500
        this.message = message || 'Internal Server Error'
        this.details = details || null
        this.trace = trace || null
    }
}

export default CustomError