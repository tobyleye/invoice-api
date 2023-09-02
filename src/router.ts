import { Router } from "express";
import * as invoiceHandlers from "./handlers/invoice";
import * as authHandlers from "./handlers/auth";
import {
  validateLogin,
  validateInvoiceUpdate,
  validateNewInvoice,
  validateSignup,
} from "./validations";
import { verifyToken, verifyInvoiceExists } from "./middleware";
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
  verifyInvoiceExists,
  invoiceHandlers.deleteInvoice
);
router.patch(
  "/invoices/:invoiceId/update",
  verifyToken,
  validateInvoiceUpdate,
  verifyInvoiceExists,
  invoiceHandlers.updateInvoice
);
router.post(
  "/invoices/:invoiceId/mark-as-paid",
  verifyToken,
  verifyInvoiceExists,
  invoiceHandlers.markInvoiceAsPaid
);

router.use(notFound);

export default router;
