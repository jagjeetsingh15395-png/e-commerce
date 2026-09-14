const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const adminsignup = require("../models/admin.signup");
const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");

// OTP Storage (in production, use Redis or database)
const otpStore = new Map();

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingAdmin = await adminsignup.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const Admin = new adminsignup({
      username,
      email,
      password: hashedPassword,
    });
    await Admin.save();
    const token = jwt.sign({ id: Admin._id }, process.env.JWT_SECRET, {
      expiresIn: "30days",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    const adminObj = Admin.toObject ? Admin.toObject() : Admin;
    delete adminObj.password;
    res.status(201).json({ admin: adminObj, token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminUser = await adminsignup.findOne({ email });
    if (!adminUser) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, adminUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    const adminObj = adminUser.toObject ? adminUser.toObject() : adminUser;
    delete adminObj.password;
    res.status(200).json({ admin: adminObj, token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.refreshAccessToken = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const newToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ token: newToken });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// OTP Configuration
const otpSecret = speakeasy.generateSecret({ length: 20 });

// Email transporter (configure with your email service)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASS || "your-email-password",
  },
});

// Generate and send OTP to email (or return OTP directly in development)
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if admin exists
    const adminUser = await adminsignup.findOne({ email });
    if (!adminUser) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Generate OTP
    const otp = speakeasy.totp({
      secret: otpSecret.base32,
      encoding: "base32",
      step: 300, // OTP valid for 5 minutes
      digits: 6,
    });

    // Store OTP with email (for verification)
    otpStore.set(email, { otp, expiresAt: Date.now() + 300000 }); // 5 minutes expiry

    // In development mode, return OTP directly to frontend
    if (process.env.NODE_ENV === "development") {
      return res.status(200).json({
        message: "OTP generated",
        email,
        otp, // Return OTP directly in development
        expiresIn: 300, // 5 minutes in seconds
      });
    }

    // In production, send email with OTP
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || "your-email@gmail.com",
        to: email,
        subject: "Your OTP for Admin Login",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Your One-Time Password</h2>
            <p>Your OTP for admin login is:</p>
            <h1 style="font-size: 24px; letter-spacing: 3px; color: #2563eb; text-align: center; padding: 20px; background: #f0f9ff; border-radius: 8px;">${otp}</h1>
            <p>This OTP is valid for <strong>5 minutes</strong>.</p>
            <p>If you didn't request this OTP, please ignore this email.</p>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              Portfolio Admin System
            </p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({
        message: "OTP sent to your email",
        email,
        otp,
      });
    } catch (mailError) {
      console.error("Error sending email:", mailError);
      // Fallback: return OTP in response if email fails
      res.status(200).json({
        message: "OTP generated (email failed)",
        email,
        otp,
      });
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Get stored OTP
    const storedData = otpStore.get(email);

    if (!storedData) {
      return res.status(400).json({ message: "OTP not found or expired" });
    }

    // Check if OTP is expired
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ message: "OTP expired" });
    }

    // Verify OTP
    const verified = speakeasy.totp.verify({
      secret: otpSecret.base32,
      encoding: "base32",
      token: otp,
      step: 300,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // OTP is valid - find admin and generate JWT token
    const adminUser = await adminsignup.findOne({ email });
    if (!adminUser) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Clear OTP after successful verification
    otpStore.delete(email);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    const adminObj = adminUser.toObject ? adminUser.toObject() : adminUser;
    delete adminObj.password;

    res.status(200).json({
      message: "Login successful",
      admin: adminObj,
      token,
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Server error" });
  }
};
