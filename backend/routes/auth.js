const express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer'); // 💡 1. IMPORT NODEMAILER
const Account = require('../models/Account');

const router = express.Router();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Force the host instead of using service: 'gmail'
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // This helps bypass some strict server-to-server TLS routing issues
    rejectUnauthorized: false 
  }
});


// 🚀 1. REGISTER (Initial Step)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const successMsg = { message: 'If the email is valid, a verification code has been sent.' };

    const existingUser = await Account.findOne({ email });
    
    // Privacy Logic: If they already exist and ARE verified, don't tell the app.
    // Send them an email instead.
    if (existingUser && existingUser.verified) {
      const mailOptions = {
        from: `"DripCheck App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'DripCheck - Account Already Exists',
        html: `<p>Hello ${name}, you already have a verified account! Please login or reset your password.</p>`
      };
      await transporter.sendMail(mailOptions).catch(err => console.log("Mail error:", err));
      return res.status(200).json(successMsg);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 15 * 60 * 1000;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Upsert the data. If an unverified user exists, it updates their OTP/Password.
    // If no user exists, it creates a new one with verified: false.
    await Account.findOneAndUpdate(
      { email },
      { 
        name, 
        password: hashedPassword, 
        resetOtp: otp, 
        resetOtpExpires: otpExpires,
        verified: false 
      },
      { upsert: true, new: true }
    );

    const mailOptions = {
      from: `"DripCheck App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'DripCheck - Verify your Account',
      html: `<h2>Welcome to DripCheck!</h2><p>Your verification code is: <strong>${otp}</strong></p>`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json(successMsg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🚀 2. VERIFY REGISTRATION (Final Step)
router.post('/verify-registration', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await Account.findOne({
      email,
      resetOtp: otp,
      resetOtpExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired code.' });
    }

    // Flip the switch to TRUE
    user.verified = true;
    user.resetOtp = null;
    user.resetOtpExpires = null;
    await user.save();

    res.status(201).json({ message: 'Account verified successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🚀 3. LOGIN (Updated with Verification Check)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const foundUser = await Account.findOne({ email }); 
    
    // Check if user exists AND is verified
    if (!foundUser || !foundUser.verified) {
      return res.status(401).json({ message: 'Invalid credentials or unverified account' });
    }

    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const { password: userPassword, resetOtp, resetOtpExpires, __v, ...userData } = foundUser._doc;

    return res.json({
      message: 'Login successful',
      user: {
        id: foundUser._id,
        ...userData 
      },
    });
  } catch (err) {
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

router.post('/request-delete-otp', async (req, res) => {
  try {
    const { email, userId } = req.body;

    // Verify the user exists using the provided ID
    const user = await Account.findById(userId);
    if (!user || user.email !== email) {
      // Don't leak whether the account exists or not for security
      return res.status(200).json({ message: 'If the account exists, an OTP was sent.' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Save the OTP to the user document
    user.resetOtp = otp;
    user.resetOtpExpires = otpExpires;
    await user.save();

    // 💡 SEND THE ACTUAL EMAIL VIA NODEMAILER
    const mailOptions = {
      from: `"DripCheck App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'DripCheck - Account Deletion Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eaeaea; border-radius: 10px;">
          <h2 style="color: #FF6B6B;">Account Deletion Request</h2>
          <p>Hello ${user.name},</p>
          <p>We received a request to permanently delete your DripCheck account. If you initiated this, please use the following 6-digit verification code to confirm the deletion:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #cc0000; background-color: #FFF0F0; padding: 15px 25px; border-radius: 8px;">
              ${otp}
            </span>
          </div>
          <p style="color: #888; font-size: 14px;"><strong>Warning:</strong> This action cannot be undone. All your closet data will be permanently removed.</p>
          <p style="color: #888; font-size: 14px;">This code will expire in 15 minutes. If you did not request this, please change your password immediately.</p>
          <p>The DripCheck Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Deletion OTP sent to ${email}`);

    res.status(200).json({ message: 'OTP generated successfully' });
  } catch (error) {
    console.error("Request Delete OTP Error:", error);
    res.status(500).json({ message: 'Server error while generating OTP' });
  }
});
// DELETE: api/auth/delete-account/:id
router.delete('/delete-account/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { otp } = req.body;

    const user = await Account.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify OTP
    if (!user.resetOtp || user.resetOtp !== otp) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    
    // Check expiration
    if (user.resetOtpExpires && Date.now() > user.resetOtpExpires) {
         return res.status(400).json({ message: "OTP has expired" });
    }

    // (Optional) Delete associated data here if you have other collections
    // e.g., await Clothing.deleteMany({ userId: userId });

    // Perform deletion
    await Account.findByIdAndDelete(userId);

    res.status(200).json({ message: "Account successfully deleted" });

  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Server error during account deletion" });
  }
});
module.exports = router;