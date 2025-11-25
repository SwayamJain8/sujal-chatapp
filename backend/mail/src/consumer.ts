import amqp from "amqplib";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const startSendOtpConsumer = async (retries = 30, delay = 3000) => {
  const hostname = process.env.RABBITMQ_HOST || "rabbitmq";
  const port = 5672;
  console.log(`Attempting to connect to RabbitMQ at ${hostname}:${port}`);

  for (let i = 0; i < retries; i++) {
    try {
      const connection = await amqp.connect({
        protocol: "amqp",
        hostname: hostname,
        port: port,
        username: process.env.RABBITMQ_USER,
        password: process.env.RABBITMQ_PASSWORD,
        heartbeat: 60,
      });

      connection.on("error", (err) => {
        console.error("RabbitMQ connection error:", err);
      });

      connection.on("close", () => {
        console.log("RabbitMQ connection closed, attempting to reconnect...");
        setTimeout(() => startSendOtpConsumer(), 5000);
      });

      const channel = await connection.createChannel();
      const queueName = "send-otp";
      await channel.assertQueue(queueName, { durable: true });

      console.log("✅ Connected to RabbitMQ and waiting for messages in send-otp queue");

      channel.consume(queueName, async (message) => {
        if (message) {
          try {
            const { to, subject, body } = JSON.parse(message.content.toString());

            // Debug logging
            console.log("Received message:", { to, subject, body });

            // Validate email
            if (!to || typeof to !== "string" || to.trim() === "") {
              console.log("Error: Invalid or missing email address:", to);
              channel.ack(message);
              return;
            }

            const transporter = nodemailer.createTransport({
              host: "smtp.gmail.com",
              port: 465,
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
              },
            });

            await transporter.sendMail({
              from: "Chat App",
              to,
              subject,
              text: body,
            });

            console.log(`OTP Email sent to ${to}`);
            channel.ack(message);
          } catch (error) {
            console.log("Error in sending email", error);
            // Acknowledge the message even if there's an error to prevent infinite retries
            channel.ack(message);
          }
        }
      });
      return; // Successfully connected, exit retry loop
    } catch (error: any) {
      const errorMsg = error?.message || error;
      console.log(`❌ Failed to connect to RabbitMQ (attempt ${i + 1}/${retries}):`, errorMsg);
      if (i < retries - 1) {
        const waitTime = delay / 1000;
        console.log(`⏳ Retrying in ${waitTime} seconds...`);
        await sleep(delay);
        delay = Math.min(delay * 1.2, 10000); // Exponential backoff, max 10s
      } else {
        console.error("❌ Max retries reached. RabbitMQ consumer failed to start.");
        throw new Error("Failed to connect to RabbitMQ after all retries");
      }
    }
  }
};
