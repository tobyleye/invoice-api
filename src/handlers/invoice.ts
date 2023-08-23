import { dbClient } from "../db";
import { object, string, number, array, date } from "yup";
import { Handler } from "../types";

let parseInvoiceItemList = (invoice: any) => {
  try {
    invoice.itemList = JSON.parse(invoice.itemList);
  } catch (err) {
    invoice.itemList = [];
  }
  return invoice;
};

const listInvoices: Handler = async (req, res) => {
  let invoices = await dbClient.invoice.findMany({
    where: {
      userId: req.user!.id,
    },
  });
  invoices.forEach(parseInvoiceItemList);
  res.json({
    message: "your invoices is retrieved",
    data: invoices,
  });
};

const getInvoice: Handler = async (req, res) => {
  let { invoiceId } = req.params;
  let invoice = await dbClient.invoice.findUnique({
    where: {
      id: invoiceId,
    },
  });
  if (!invoice) {
    return res.status(404).json({ message: "invoice not found" });
  }
  parseInvoiceItemList(invoice);
  return res.json({ invoice });
};

const createInvoice: Handler = async (req, res) => {
  let invoiceSchema = object({
    billFromCity: string().required(),
    billFromStreetAddress: string().required(),
    billFromPostCode: string().required(),
    country: string().required(),
    clientName: string().required(),
    clientEmail: string().email().required(),
    clientStreetAddress: string().required(),
    clientCity: string().required(),
    clientPostCode: string().required(),
    clientCountry: string().required(),
    projectDescription: string(),
    invoiceDate: date().required(),
    itemList: array(
      object({
        name: string().required(),
        quantity: number().default(1),
        price: number().required(),
      })
    ),
  });

  let invoice;
  let { saveAsDraft = false } = req.params;

  try {
    invoice = await invoiceSchema.validate(req.body);
  } catch (err: any) {
    res.status(400).json({ message: "validate error", errors: err.errors });
    return;
  }

  // create invoice
  let user = req.user!;
  let userId = user.id;
  try {
    const createdInvoice = await dbClient.invoice.create({
      data: {
        billFromStreetAddress: invoice.billFromStreetAddress,
        billFromCity: invoice.billFromCity,
        billFromPostCode: invoice.billFromPostCode,
        country: invoice.country,
        status: saveAsDraft ? "draft" : "pending",
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
        clientStreetAddress: invoice.clientStreetAddress,
        clientCity: invoice.clientCity,
        clientPostCode: invoice.clientPostCode,
        clientCountry: invoice.clientCountry,
        itemList: JSON.stringify(invoice.itemList),
        invoiceDate: new Date(invoice.invoiceDate),
        projectDescription: invoice.projectDescription,
        userId: userId,
      },
    });
    res.status(200).json({ invoice: createdInvoice });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Unable to create invoice right now. try again." });
  }
};

const deleteInvoice: Handler = async (req, res) => {
  let { invoiceId } = req.params;
  try {
    await dbClient.invoice.delete({
      where: {
        id: invoiceId,
      },
    });
    res.status(200).send();
  } catch (err) {
    res.status(500).json({ message: "fatal error occurred" });
  }
};

const updateInvoice: Handler = async (req, res) => {
  let { invoiceId } = req.params;
  let updateInvoiceSchema = object({
    billFromCity: string(),
    billFromStreetAddress: string(),
    billFromPostCode: string(),
    country: string(),
    clientName: string(),
    clientEmail: string().email(),
    clientStreetAddress: string(),
    clientCity: string(),
    clientPostCode: string(),
    clientCountry: string(),
    projectDescription: string(),
    invoiceDate: string(),
    itemList: array(
      object({
        name: string().required(),
        quantity: number().required(),
        price: number().required(),
      })
    ),
  });

  let invoice;

  try {
    invoice = await updateInvoiceSchema.validate(req.body);
  } catch (err: any) {
    return res.status(400).json({
      message: "validation error",
      errors: err.errors,
    });
  }

  try {
    let updatedInvoice = await dbClient.invoice.update({
      where: {
        id: invoiceId,
      },
      data: {
        billFromStreetAddress: invoice.billFromStreetAddress,
        billFromCity: invoice.billFromCity,
        billFromPostCode: invoice.billFromPostCode,
        country: invoice.country,
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
        clientStreetAddress: invoice.clientStreetAddress,
        clientCity: invoice.clientCity,
        clientPostCode: invoice.clientPostCode,
        clientCountry: invoice.clientCountry,
        invoiceDate: invoice.invoiceDate,
        projectDescription: invoice.projectDescription,
        itemList: JSON.stringify(invoice.itemList),
      },
    });

    res.status(200).json({ invoice: updatedInvoice });
  } catch (err) {
    res.status(500).json({ message: "fatal error" });
  }
};

const markInvoiceAsPaid: Handler = async (req, res) => {
  let { invoiceId } = req.params;
  await dbClient.invoice.update({
    where: {
      id: invoiceId,
    },
    data: {
      status: "paid",
    },
  });
  res.status(200).send();
};

export {
  listInvoices,
  getInvoice,
  createInvoice,
  deleteInvoice,
  updateInvoice,
  markInvoiceAsPaid,
};
