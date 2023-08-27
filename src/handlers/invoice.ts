import { dbClient } from "../db";
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
  let invoice = req.body;
  let { saveAsDraft = false } = req.params;

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
    parseInvoiceItemList(createdInvoice);
    res.status(200).json({
      invoice: createdInvoice,
      message: "Invoice created successfully",
    });
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

  let invoice = req.body;

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
    parseInvoiceItemList(updatedInvoice);
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
