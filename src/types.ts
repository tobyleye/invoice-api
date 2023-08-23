import { NextFunction, Response, Request as _Request } from "express";

type User = {
  id: string;
  email: string;
  name: string;
};

export type Request = _Request & {
  user?: User;
};

export type Handler = (
  req: Request,
  res: Response,
  next?: NextFunction
) => void;
