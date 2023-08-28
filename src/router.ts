import { Router } from "express";
import * as invoiceHandlers from "./handlers/invoice";
import * as authHandlers from "./handlers/auth";
import {
  validateLogin,
  validateInvoiceUpdate,
  validateNewInvoice,
  validateSignup,
} from "./validations";
import { verifyToken } from "./middleware";
import { notFound } from "./handlers/404";

const router = Router();
router.post("/signup", validateSignup, authHandlers.register);
router.post("/login", validateLogin, authHandlers.login);

router.post(
  "/invoices/new",
  verifyToken,
  validateNewInvoice,
  invoiceHandlers.createInvoice
);
router.get("/invoices", verifyToken, invoiceHandlers.listInvoices);
router.get("/invoices/list", verifyToken, invoiceHandlers.listInvoices);
router.get("/invoices/:invoiceId", verifyToken, invoiceHandlers.getInvoice);
router.delete(
  "/invoices/:invoiceId/delete",
  verifyToken,
  invoiceHandlers.deleteInvoice
);
router.patch(
  "/invoices/:invoiceId/update",
  verifyToken,
  validateInvoiceUpdate,
  invoiceHandlers.updateInvoice
);
router.post(
  "/invoices/:invoiceId/mark-as-paid",
  verifyToken,
  invoiceHandlers.markInvoiceAsPaid
);

router.use(notFound);

export default router;
