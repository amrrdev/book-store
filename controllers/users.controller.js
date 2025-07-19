const User = require("../models/user.model.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role = "user" } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
    });

    user.password = undefined;
    user.refreshToken = undefined;
    user._id = undefined;
    user.__v = undefined;

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "6h",
      }
    );

    const refreshToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: "7d",
      }
    );

    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({ message: "Login successful", accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token is not provided." });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Refresh token incorrect" });
    }

    const newAccessToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "6h" }
    );

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(500).json({ message: "Error while refreshing the token." });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "firstName lastName email createdAt updatedAt"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

exports.updateUserById = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const user = await User.findById(req.params.id).select("-refreshToken -__v");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (password) user.password = password;

    await user.save();

    user.password = undefined;

    res.status(200).json({ message: "User was edited successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("firstName lastName email role createdAt updatedAt");
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

exports.deleteUserById = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id).select("firstName lastName email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
