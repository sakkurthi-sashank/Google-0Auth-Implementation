import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:8080/api/auth/callback/google";

const app = express();

app.get("/server-status", (req, res) => {
  res.send({
    message: "Server is running",
  });
});

app.get("/api/auth/callback/google", (req, res) => {
  const { code } = req.query;

  console.log(code);

  axios
    .post("https://oauth2.googleapis.com/token", null, {
      params: {
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
        scope:
          "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
      },
    })
    .then((response) => {
      console.log(response.data);
      res.redirect(
        `http://localhost:5173/?access_token=${response.data.access_token}&refresh_token=${response.data.refresh_token}`
      );
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send("Error handling OAuth callback");
    });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
