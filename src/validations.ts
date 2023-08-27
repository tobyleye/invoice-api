import { NextFunction, Response, Request } from "express";
import { AnyObject, ObjectSchema } from "yup";
import { object, string, array, number, date } from "yup";

const BodyValidator = (schema: ObjectSchema<AnyObject>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.validate(req.body);
      next();
    } catch (err: any) {
      return res
        .status(500)
        .json({ message: "validation error", errors: err.errors });
    }
  };
};

export const validateSignup = BodyValidator(
  object({
    name: string().required(),
    email: string().email().required(),
    password: string().min(6).required(),
  })
);

export const validateLogin = BodyValidator(
  object({
    email: string().email().required(),
    password: string().min(6).required(),
  })
);

export const validateNewInvoice = BodyValidator(
  object({
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
  })
);

export const validateInvoiceUpdate = BodyValidator(
  object({
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
  })
);
