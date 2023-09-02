import { Response, NextFunction } from "express";
import { dbClient } from "./db";
import { config } from "./config";
import jwt from "jsonwebtoken";
import { Request } from "./types";

export async function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "ahh! auth token is required!" });
  }

  try {
    let userId = jwt.verify(token, config.JWT_SECRET_KEY) as string;
    if (userId) {
      let user = await dbClient.user.findFirst({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });
      if (user) {
        req.user = user;
        return next();
      }
    }
    throw new Error("token is invalid");
  } catch (err: any) {
    res.status(401).json({
      message: `Sorry, we couldn't validate your token because (${err.message})`,
    });
  }
}

export async function verifyInvoiceExists(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    let { invoiceId } = req.params;
    let invoiceFound = await dbClient.invoice.findFirst({
      where: {
        id: invoiceId,
      },
    });
    console.log(invoiceFound);
    if (!invoiceFound) {
      return res.status(404).json({ message: "invoice not found " });
    }
    next();
  } catch (err) {
    console.error("error loading invoice: ", err);
    res.status(500).json({ message: "an error occurred loading invoice" });
  }
}
