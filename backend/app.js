import express from "express";
import { dbConnection } from "./database/dbConnection.js";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
import { errorMiddleware } from "./middlewares/error.js";
import messageRouter from "./router/messageRouter.js";
import userRouter from "./router/userRouter.js";
import appointmentRouter from "./router/appointmentRouter.js";

app.use(cors());

const app = express();
config({ path: "./config/config.env" });

// ✅ CORS setup
const allowedOrigins = [
  process.env.FRONTEND_URL_ONE, // Netlify frontend
  process.env.FRONTEND_URL_TWO, // Local frontend
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow requests like Postman or curl
    if (allowedOrigins.includes(origin)) {
      callback(null, true); // allowed origin
    } else {
      callback(new Error(`CORS policy: Origin ${origin} not allowed`), false);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

// Handle preflight requests for all routes
app.options("*", cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: "/tmp/",
}));

// Routes
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/appointment", appointmentRouter);

// Database
dbConnection();

// Error handling
app.use(errorMiddleware);

export default app;
