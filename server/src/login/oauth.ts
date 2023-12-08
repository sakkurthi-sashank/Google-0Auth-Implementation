import express, { Request, Response } from "express";
import axios, { AxiosResponse } from "axios";
import jwt from "jsonwebtoken";

interface GoogleAccessTokenResponse {
  access_token: string;
}

interface GoogleUserInfoResponse {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

export const oauthRouter = express.Router();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;
const CLIENT_BASE_URL = process.env.CLIENT_BASE_URL as string;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URL as string;

oauthRouter.get(
  "/api/auth/callback/google",
  async (req: Request, res: Response) => {
    try {
      const { code } = req.query;
      if (!code) {
        throw new Error("Authorization code missing");
      }

      const tokenResponse: AxiosResponse<GoogleAccessTokenResponse> =
        await axios.post("https://oauth2.googleapis.com/token", null, {
          params: {
            code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: "authorization_code",
            redirect_uri: REDIRECT_URI,
            scope:
              "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
          },
        });

      const userInfoResponse: AxiosResponse<GoogleUserInfoResponse> =
        await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: {
            Authorization: `Bearer ${tokenResponse.data.access_token}`,
          },
        });

      const data: GoogleAccessTokenResponse & {
        access_token: string;
      } = {
        ...userInfoResponse.data,
        access_token: tokenResponse.data.access_token,
      };

      const jwtToken = jwt.sign(data, process.env.JWT_SECRET!, {
        expiresIn: "1h",
      });

      res.redirect(`${CLIENT_BASE_URL}/?token=${jwtToken}`);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error handling OAuth callback");
    }
  }
);
