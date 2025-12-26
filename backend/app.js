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

// Load environment variables
config({ path: "./config/config.env" });

// Create Express app
const app = express();


// Allowed frontend URLs
const allowedOrigins = [
  'https://cliniiq.netlify.app',
  'http://localhost:5174',
  process.env.FRONTEND_URL_ONE, // Netlify
  process.env.FRONTEND_URL_TWO, // Local dev
].filter(Boolean); // Remove any undefined values

// Log allowed origins for debugging
console.log('Allowed CORS origins:', allowedOrigins);

// ✅ CORS setup
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like Postman, curl)
      if (!origin) return callback(null, true);
      
      // Check if the origin is in the allowed list or a subdomain
      const isAllowed = allowedOrigins.some(allowedOrigin => {
        return (
          origin === allowedOrigin || 
          (origin.endsWith('.netlify.app') && allowedOrigin.includes('netlify.app'))
        );
      });

      if (isAllowed) {
        return callback(null, true);
      }

      // Log blocked origins for debugging
      console.log('Blocked by CORS:', origin);
      return callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true, // Allow cookies
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// Routes
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/appointment", appointmentRouter);

// Connect to database
dbConnection();

// Error handling
app.use(errorMiddleware);

// Export app
export default app;
