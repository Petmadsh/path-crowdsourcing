import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import createError from "http-errors";

export function validate(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      createError.BadRequest(
        errors.array().map(err => 
          "param" in err ? `${err.param}: ${err.msg}` : err.msg
        ).join(", ")
      )
    );
  }

  next();
}