class CustomError {
  constructor(status, message, details = null, trace = null) {
    this.status = status;
    this.message = message;
    this.details = details;
    this.trace = trace;
  }
}

export default CustomError;
