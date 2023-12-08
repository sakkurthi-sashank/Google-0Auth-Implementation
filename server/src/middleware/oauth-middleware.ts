import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const oauthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization;
  const access_token = token?.toString().split(" ")[1];

  if (!access_token) {
    return res.status(401).send({
      message: "Invalid Request",
    });
  }

  try {
    const decoded = jwt.verify(access_token, process.env.JWT_SECRET!);
    res.locals.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Invalid User",
    });
  }
};
