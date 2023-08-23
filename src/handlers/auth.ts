import { object, string } from "yup";
import { Handler } from "../types";
import { dbClient } from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config";

const SALT_ROUNDS = 10;

export const register: Handler = async (req, res, next) => {
  let user;
  try {
    let registerSchema = object({
      name: string().required(),
      email: string().email().required(),
      password: string().min(6).required(),
    });
    user = await registerSchema.validate(req.body);
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: "validation error", errors: err.errors });
  }
  try {
    let existingUser = await dbClient.user.findFirst({
      where: {
        email: user.email,
      },
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "account has been taken, sorry :)" });
    }

    let hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
    const createdUser = await dbClient.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
    let token = jwt.sign(createdUser.id, config.JWT_SECRET_KEY);

    return res.status(200).json({
      data: {
        user: createdUser,
        token,
      },
    });
  } catch (err) {
    console.log("error --", err);
    res.status(500).json({
      message: "unable to create an account at the moment. try again?",
    });
  }
};

export const login: Handler = async (req, res) => {
  let user;
  try {
    let registerSchema = object({
      email: string().email().required(),
      password: string().min(6).required(),
    });
    user = await registerSchema.validate(req.body);
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: "validation error", errors: err.errors });
  }

  let searchedUser = await dbClient.user.findFirst({
    where: {
      email: user.email,
    },
  });

  let credentialsValid = false;

  if (searchedUser) {
    credentialsValid = await bcrypt.compare(
      user.password,
      searchedUser.password
    );
  }

  if (credentialsValid === false) {
    return res.status(401).json({
      message: `account doesn't exist`,
    });
  }

  searchedUser = searchedUser!;

  return res.json({
    user: {
      email: searchedUser?.email,
      name: searchedUser?.name,
    },
    token: jwt.sign(searchedUser.id, config.JWT_SECRET_KEY),
  });
};
