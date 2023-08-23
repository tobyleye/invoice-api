import { NextFunction, Response, Request } from "express";

export type Handler = (
  req: Request,
  res: Response,
  next?: NextFunction
) => void;
