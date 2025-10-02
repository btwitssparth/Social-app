// app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: process.env.CROSS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes imports
import userRoutes from "./routes/Auth.routes.js";
import postRoutes from "./routes/Post.routes.js";

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/post", postRoutes);

export { app };
