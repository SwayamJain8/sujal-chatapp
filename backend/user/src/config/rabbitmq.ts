import amql from "amqplib";

let channel: amql.Channel;
let connection: amql.Connection;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const connectRabbitMQ = async (retries = 30, delay = 3000) => {
  const hostname = process.env.RABBITMQ_HOST || "rabbitmq";
  const port = 5672;
  console.log(`Attempting to connect to RabbitMQ at ${hostname}:${port}`);

  for (let i = 0; i < retries; i++) {
    try {
      connection = await amql.connect({
        protocol: "amqp",
        hostname: hostname,
        port: port,
        username: process.env.RABBITMQ_USER,
        password: process.env.RABBITMQ_PASSWORD,
        heartbeat: 60,
      });

      connection.on("error", (err) => {
        console.error("RabbitMQ connection error:", err);
        channel = null as any;
      });

      connection.on("close", () => {
        console.log("RabbitMQ connection closed");
        channel = null as any;
      });

      channel = await connection.createChannel();
      console.log("✅ Connected to RabbitMQ successfully");
      return;
    } catch (err: any) {
      const errorMsg = err?.message || err;
      console.log(
        `❌ Failed to connect to RabbitMQ (attempt ${i + 1}/${retries}):`,
        errorMsg
      );
      if (i < retries - 1) {
        const waitTime = delay / 1000;
        console.log(`⏳ Retrying in ${waitTime} seconds...`);
        await sleep(delay);
        delay = Math.min(delay * 1.2, 10000); // Exponential backoff, max 10s
      } else {
        console.error("❌ Max retries reached. RabbitMQ connection failed.");
        throw new Error("Failed to connect to RabbitMQ after all retries");
      }
    }
  }
};

export const publishToQueue = async (queueName: string, message: any) => {
  if (!channel) {
    console.log("Rabbitmq channel is not initialized");
    return;
  }

  await channel.assertQueue(queueName, { durable: true });

  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
};
