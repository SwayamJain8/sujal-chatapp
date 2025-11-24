import { generateToken } from "../config/generateToken.js";
import { publishToQueue } from "../config/rabbitmq.js";
import TryCatch from "../config/TryCatch.js";
import { redisClient } from "../index.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { User } from "../models/User.js";

export const loginUser = TryCatch(async (req, res) => {
  const { email } = req.body;

  // Debug logging
  console.log("Login request received for email:", email);

  if (!email) {
    res.status(400).json({ message: "Email is required" });
    return;
  }

  const rateLimitKey = `otp:ratelimit:${email}`;
  const rateLimit = await redisClient.get(rateLimitKey);

  if (rateLimit) {
    res.status(429).json({
      message: "Too many requests. Please wait before requesting new OTP",
    });
    return;
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const otpKey = `otp:${email}`;
  await redisClient.set(otpKey, otp, {
    EX: 60 * 5,
  });

  await redisClient.set(rateLimitKey, "true", {
    EX: 60,
  });

  const message = {
    to: email,
    subject: "Your OTP for login",
    body: `Your OTP is ${otp}. It is valid for 5 minutes.`,
  };

  // Debug logging
  console.log("Sending message to queue:", message);

  await publishToQueue("send-otp", message);

  res.status(200).json({ message: "OTP sent successfully" });
});

export const verifyUser = TryCatch(async (req, res) => {
  const { email, otp: enteredOtp } = req.body;

  if (!email || !enteredOtp) {
    res.status(400).json({ message: "Email and OTP are required" });
    return;
  }

  const otpKey = `otp:${email}`;
  const storedOtp = await redisClient.get(otpKey);

  if (!storedOtp || storedOtp !== enteredOtp) {
    res.status(400).json({ message: "Invalid OTP" });
    return;
  }

  await redisClient.del(otpKey);

  let user = await User.findOne({ email });

  if (!user) {
    const name = email.split("@")[0];
    user = await User.create({ name, email });
  }

  const token = generateToken(user);

  res.status(200).json({ message: "OTP verified successfully", user, token });
});

export const myProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;

  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  res.status(200).json({ user });
});

export const updateName = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = await User.findById(req.user?._id);

  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  user.name = req.body.name;
  await user.save();

  const token = generateToken(user);

  res.status(200).json({ message: "Name updated successfully", user, token });
});

export const getAllUsers = TryCatch(async (req: AuthenticatedRequest, res) => {
  const users = await User.find({});

  res.status(200).json({ users });
});

export const getAUser = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.status(200).json({ user });
});
