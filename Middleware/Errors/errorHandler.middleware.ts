import { CustomError } from "./CustomError";
import { Request, Response, NextFunction } from "express";
import { t } from "i18next";

export const errorHandler = (
  err: Error | CustomError | unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  if (res.headersSent || !(err instanceof CustomError)) return next(err);
  return res.status(err.status).json({
    error: t(err.message),
    details: err.details || null,
  });
};
