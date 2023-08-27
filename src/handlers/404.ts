import { Request } from "../types";
import { Response } from "express";

export const notFound = (req: Request, res: Response) => {
  let message = [
    "route not found.",
    `The message you're seeing now is equivalent to what you see when you visit a website page that doesn't exist`,
  ];
  res.status(404).json({
    message: message.join(" "),
  });
};
