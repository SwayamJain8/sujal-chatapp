import amqp from "amqplib";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const startSendOtpConsumer = async () => {
  try {
    const connection = await amqp.connect({
      protocol: "amqp",
      hostname: process.env.RABBITMQ_HOST,
      port: 5672,
      username: process.env.RABBITMQ_USER,
      password: process.env.RABBITMQ_PASSWORD,
    });
    const channel = await connection.createChannel();
    const queueName = "send-otp";
    await channel.assertQueue(queueName, { durable: true });

    console.log("Waiting for messages in send-otp queue");

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
  } catch (error) {
    console.log("Faled to start rabbitmq consumer", error);
  }
};
