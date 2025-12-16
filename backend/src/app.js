// app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import aiRoutes from "./routes/ai.routes.js";


const app = express();

app.use(cors({
    origin: process.env.CROSS_ORIGIN ,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes imports
import userRoutes from "./routes/Auth.routes.js";
import postRoutes from "./routes/Post.routes.js";
import messageRoutes from "./routes/message.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";

app.use("/api/v1/message", messageRoutes);
app.use("/api/v1/conversation", conversationRoutes);

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/post", postRoutes);
app.use("/api/v1/ai", aiRoutes);


export { app };
