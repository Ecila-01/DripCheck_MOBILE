const express = require('express');
const bcrypt = require('bcrypt');
const Account = require('../models/Account');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email, and password are required',
      });
    }

    const existingUser = await Account.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'Email already registered',
      });
    }

    //password hashing w bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new Account({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the user
    const foundUser = await Account.findOne({ email }); // Rename to foundUser to be safe
    if (!foundUser) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 2. Check password
    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 3. SECURE DATA EXTRACTION
    // We use foundUser._doc to get the raw data from MongoDB
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
// Update Profile (Image and Name)
// Update Profile (Dynamic)
router.put('/update/:id', async (req, res) => {
  try {
    // 1. Separate the password from the rest of the incoming data
    const { password, ...restOfData } = req.body;
    
    // 2. Initialize updateData with whatever else was sent 
    // (This automatically grabs name, profileImage, hasSetPreferences, notificationTime, etc.)
    let updateData = { ...restOfData };

    // 3. If a password was sent, hash it and add it to the update object
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // 4. Update the user
    const updatedUser = await Account.findByIdAndUpdate(
      req.params.id,
      { $set: updateData }, // $set ensures we only overwrite the provided fields
      { new: true }         // Return the updated document
    ).select('-password');  // Don't send the hashed password back to the frontend

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
      // Security best practice: Don't tell the user if the email exists or not
      // Just pretend it worked so hackers can't "guess" registered emails.
      return res.status(200).json({ message: 'If the email exists, an OTP was sent.' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration time (e.g., 15 minutes from now)
    const otpExpires = Date.now() + 15 * 60 * 1000; 

    // Save to database
    user.resetOtp = otp;
    user.resetOtpExpires = otpExpires;
    await user.save();

    // ⚠️ TODO: Actually send the email here using Nodemailer or SendGrid!
    // For now, we will just log it to your server console so you can test it:
    console.log(`\n📧 SIMULATED EMAIL TO ${email}: Your DripCheck OTP is ${otp}\n`);

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

    // 1. Find the user with matching email, matching OTP, AND ensure it hasn't expired
    const user = await Account.findOne({
      email: email,
      resetOtp: otp,
      resetOtpExpires: { $gt: Date.now() } // $gt means "Greater Than" right now
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }

    // 2. Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 3. Update the user: Set new password and CLEAR the OTP fields so it can't be reused
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
