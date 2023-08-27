import express from "express";
import router from "./router";
import { dbClient } from "./db";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// define index route
app.get("/", (req, res) => {
  res.json({
    message:
      "you have reached the invoice api, leave a message. haha.. just kidding.",
  });
});

app.use("/api/v1", router);

const PORT = process.env.PORT ?? 5138;

const startServer = async () => {
  await dbClient
    .$connect()
    .catch(() =>
      console.log(`database failed to connect for some reason. should we bail?`)
    );

  app.listen(PORT, () =>
    console.log(`invoice-api is listening on port :${PORT}`)
  );
};

startServer();
