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

const router = Router();
router.post("/signup", validateSignup, authHandlers.register);
router.post("/login", validateLogin, authHandlers.login);

router.use(verifyToken);

router.post("/invoices/new", validateNewInvoice, invoiceHandlers.createInvoice);
router.get("/invoices", invoiceHandlers.listInvoices);
router.get("/invoices/:invoiceId", invoiceHandlers.getInvoice);
router.delete("/invoices/:invoiceId/delete", invoiceHandlers.deleteInvoice);
router.patch(
  "/invoices/:invoiceId/update",
  validateInvoiceUpdate,
  invoiceHandlers.updateInvoice
);
router.post(
  "/invoices/:invoiceId/mark-as-paid",
  invoiceHandlers.markInvoiceAsPaid
);

export default router;
