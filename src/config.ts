import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY!;

export const config = {
  JWT_SECRET_KEY,
};
