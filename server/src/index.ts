import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

import { oauthRouter } from "./login/oauth";
import { oauthMiddleware } from "./middleware/oauth-middleware";

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send({
    message: "Server is running",
  });
});

app.get("/public", (req, res) => {
  res.send({
    message: "This is a public route",
  });
});

app.use(oauthRouter);

app.use(oauthMiddleware);

app.get("/private", (req, res) => {
  res.send({
    message: "This is a private route",
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
