import { Router, Request, Response, NextFunction } from "express";
import * as invoiceHandlers from "./handlers/invoice";
import * as authHandlers from "./handlers/auth";
import jwt from "jsonwebtoken";
import { config } from "./config";
import { dbClient } from "./db";

const router = Router();

router.post("/signup", authHandlers.register);
router.post("/login", authHandlers.login);

router.use(verifyToken);

router.post("/invoices/new", invoiceHandlers.createInvoice);
router.get("/invoices", invoiceHandlers.listInvoices);
router.get("/invoices/:invoiceId", invoiceHandlers.getInvoice);
router.delete("/invoices/:invoiceId/delete", invoiceHandlers.deleteInvoice);
router.patch("/invoices/:invoiceId/update", invoiceHandlers.updateInvoice);
router.post(
  "/invoices/:invoiceId/mark-as-paid",
  invoiceHandlers.markInvoiceAsPaid
);

async function verifyToken(req: Request, res: Response, next: NextFunction) {
  let token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "auth token is required!" });
  }

  try {
    let userId = jwt.verify(token, config.JWT_SECRET_KEY) as string;
    if (userId === undefined) {
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
    res.status(401).json({ message: err.message });
  }
}

export default router;
