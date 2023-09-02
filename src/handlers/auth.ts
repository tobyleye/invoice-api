import { Handler } from "../types";
import { dbClient } from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config";

const SALT_ROUNDS = 10;

export const register: Handler = async (req, res, next) => {
  const user = req.body;
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
    let token = jwt.sign(createdUser.id, config.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      data: {
        user: createdUser,
        token,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "unable to create an account at the moment. try again?",
    });
  }
};

export const login: Handler = async (req, res) => {
  const user = req.body;
  try {
    let searchedUser = await dbClient.user.findFirst({
      where: {
        email: user.email,
      },
    });

    if (!searchedUser) {
      return res.status(401).json({
        message: "Account does not exist",
      });
    }

    let credentialsValid = await bcrypt.compare(
      user.password,
      searchedUser.password
    );

    if (credentialsValid === false) {
      return res.status(401).json({
        message: `Email or password not correct`,
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
  } catch (err) {
    res.status(500).json({
      message: "unable to sign in at the moment. try again?",
    });
  }
};
