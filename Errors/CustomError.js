class CustomError {
    constructor(status, message, details) {
        this.status = status || 500
        this.message = message || 'Internal Server Error'
        this.details = details || null
    }
}

export default CustomError