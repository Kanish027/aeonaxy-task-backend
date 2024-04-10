import express from "express";
import "dotenv/config";
import databaseConnection from "./database/dbConnect.js";
import userRouter from "./routes/user.js";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";

const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

databaseConnection();

// Middleware to parse JSON requests and handle large payloads
app.use(express.json({ limit: "100mb" }));

// Middleware to parse URL-encoded requests and handle large payloads
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// Middleware to parse cookies
app.use(cookieParser());

app.use("/api/v1/user", userRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server is listening on PORT ${process.env.PORT}`);
});
