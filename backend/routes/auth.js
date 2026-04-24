const express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer'); // 💡 1. IMPORT NODEMAILER
const Account = require('../models/Account');

const router = express.Router();

// 💡 2. CONFIGURE THE EMAIL TRANSPORTER
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // This must be an App Password, not your normal password!
  },
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await Account.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new Account({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const foundUser = await Account.findOne({ email }); 
    if (!foundUser) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const { password: userPassword, __v, ...userData } = foundUser._doc;

    return res.json({
      message: 'Login successful',
      user: {
        id: foundUser._id,
        ...userData 
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: err.message });
  }
});

// Update Profile
router.put('/update/:id', async (req, res) => {
  try {
    const { password, ...restOfData } = req.body;
    let updateData = { ...restOfData };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await Account.findByIdAndUpdate(
      req.params.id,
      { $set: updateData }, 
      { new: true }        
    ).select('-password'); 

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🚀 1. REQUEST OTP ROUTE
router.post('/forgot-password-otp', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await Account.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: 'If the email exists, an OTP was sent.' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 15 * 60 * 1000; 

    // Save to database
    user.resetOtp = otp;
    user.resetOtpExpires = otpExpires;
    await user.save();

    // 💡 3. SEND THE ACTUAL EMAIL
    const mailOptions = {
      from: `"DripCheck App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'DripCheck - Password Reset Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eaeaea; border-radius: 10px;">
          <h2 style="color: #4A90E2;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>You requested to reset your password. Please use the following 6-digit verification code to securely reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; background-color: #f5f5f5; padding: 15px 25px; border-radius: 8px;">
              ${otp}
            </span>
          </div>
          <p style="color: #888; font-size: 14px;">This code will expire in 15 minutes. If you did not request this, please ignore this email.</p>
          <p>Stay fresh,<br><strong>The DripCheck Team</strong></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${email}`);

    res.status(200).json({ message: 'OTP generated successfully' });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🚀 2. VERIFY OTP & RESET PASSWORD ROUTE
router.post('/reset-password-otp', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await Account.findOne({
      email: email,
      resetOtp: otp,
      resetOtpExpires: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetOtp = null;
    user.resetOtpExpires = null;

    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;