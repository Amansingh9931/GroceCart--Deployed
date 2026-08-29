import UserModel from "../Models/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import { OAuth2Client } from "google-auth-library";
import "dotenv/config";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// GOOGLE LOGIN
export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Google token missing" });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name } = ticket.getPayload();
    const normalizedEmail = email.toLowerCase().trim();

    const user = await UserModel.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $setOnInsert: {
          name,
          email: normalizedEmail,
          password: "google-auth",
          authProvider: "google",
          role: "user",
          address: "",
        },
      },
      { new: true, upsert: true }
    ).select("-password");

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );

    res.status(200).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(500).json({ message: "Google login failed" });
  }
};

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, mobile, role, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Check for duplicate email
    const emailExists = await UserModel.findOne({ email: normalizedEmail });
    if (emailExists) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Check for duplicate mobile number
    if (mobile) {
      const mobileExists = await UserModel.findOne({ mobile });
      if (mobileExists) {
        return res.status(409).json({ message: "Mobile number already registered" });
      }
    }

    if (role === "admin") {
      return res.status(403).json({ message: "Admin registration blocked" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      mobile,
      address: address || "",
      role: role === "deliveryBoy" ? "deliveryBoy" : "user",
      authProvider: "manual",
      status: "active",
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
};

// LOGIN USER (ADMIN + NORMAL USER)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ADMIN LOGIN
    if (
      email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase() &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        { id: "admin", role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES }
      );

      return res.json({
        success: true,
        token,
        user: {
          name: "Admin",
          email,
          role: "admin",
        },
      });
    }

    const user = await UserModel.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Check user status
    if (user.status === "inactive") {
      return res.status(403).json({ 
        message: "Your account is inactive. Please contact support.",
        status: "inactive"
      });
    }

    if (user.status === "banned") {
      return res.status(403).json({ 
        message: "Your account has been banned. You cannot login.",
        status: "banned"
      });
    }

    if (user.authProvider === "google") {
      return res.status(400).json({ message: "Login with Google" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { name, mobile, address } = req.body;

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { name, mobile, address },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Profile update failed" });
  }
};

// GET ALL USERS BY ROLE (for admin)
export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;

    // Validate role
    if (!["user", "deliveryBoy"].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid role" 
      });
    }

    const users = await UserModel.find({ role }).select("-password").sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get Users By Role Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch users" 
    });
  }
};

// GET SINGLE USER DETAILS (for admin)
export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await UserModel.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get User Details Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch user details" 
    });
  }
};

// CHANGE USER STATUS (Admin only)
export const changeUserStatus = async (req, res) => {
  try {
    const { userId, status } = req.body;

    if (!userId || !status) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID and status required" 
      });
    }

    if (!["active", "inactive", "banned"].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid status. Must be active, inactive, or banned" 
      });
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.json({
      success: true,
      message: `User status changed to ${status}`,
      user,
    });
  } catch (error) {
    console.error("Change User Status Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to change user status" 
    });
  }
};


// GET ALL ADMIN STATS
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await UserModel.countDocuments({ role: "user" });
    const totalDeliveryBoys = await UserModel.countDocuments({ role: "deliveryBoy" });
    const totalAdmins = await UserModel.countDocuments({ role: "admin" });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalDeliveryBoys,
        totalAdmins,
        totalAccounts: totalUsers + totalDeliveryBoys + totalAdmins,
      },
    });
  } catch (error) {
    console.error("Get Admin Stats Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch stats" 
    });
  }
};
