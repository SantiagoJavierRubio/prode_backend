import CustomError from "./CustomError.js";
import i18n from "i18n";

const errorHandler = (err, req, res, next) => {
  if (res.headersSent || !(err instanceof CustomError)) return next(err);
  console.log(err);
  return res.status(err.status).json({
    error: i18n.__(err.message),
    details: err.details ? i18n.__(err.details) : null,
  });
};

export default errorHandler;
