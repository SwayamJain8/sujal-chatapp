import express from "express";
import dotenv from "dotenv";
import { startSendOtpConsumer } from "./consumer.js";

dotenv.config();

const startServer = async () => {
  try {
    // Connect to RabbitMQ and start consumer (with retries)
    await startSendOtpConsumer();

    // Start Express server
    const app = express();

    app.listen(process.env.PORT, () => {
      console.log(`Mail service is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
