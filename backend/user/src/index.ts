import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { createClient } from "redis";
import userRoutes from "./routes/user.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import cors from "cors";

dotenv.config();

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

const startServer = async () => {
  try {
    // Connect to database
    connectDB();

    // Connect to RabbitMQ (with retries)
    await connectRabbitMQ();

    // Connect to Redis
    redisClient
      .connect()
      .then(() => console.log("Connected to Redis"))
      .catch((err) => console.log("Error connecting to Redis", err));

    // Start Express server
    const app = express();
    app.use(express.json());
    app.use(cors());

    app.use("/api/v1", userRoutes);

    const PORT = process.env.PORT;

    app.listen(PORT, () => {
      console.log(`User service is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
