import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { authenticate, adminOnly, AuthRequest } from "../middleware/auth";

const router = Router();

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: "Username and password are required" });
      return;
    }

    const user = await User.findOne({ username });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        permissions: user.permissions,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/register - Admin only
router.post(
  "/register",
  authenticate,
  adminOnly,
  async (req: AuthRequest, res: Response) => {
    try {
      const { username, password, fullName, role } = req.body;

      if (!username || !password || !fullName) {
        res.status(400).json({ error: "All fields are required" });
        return;
      }

      const existingUser = await User.findOne({ username });
      if (existingUser) {
        res.status(400).json({ error: "Username already exists" });
        return;
      }

      const user = new User({
        username,
        password,
        fullName,
        role: role || "staff",
      });
      await user.save();

      res.status(201).json({
        message: "User created successfully",
        user: {
          id: user._id,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
          permissions: user.permissions,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

// GET /api/auth/profile
router.get(
  "/profile",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    res.json({
      user: {
        id: req.user!._id,
        username: req.user!.username,
        fullName: req.user!.fullName,
        role: req.user!.role,
        permissions: req.user!.permissions,
      },
    });
  }
);

// GET /api/auth/users - Admin only
router.get(
  "/users",
  authenticate,
  adminOnly,
  async (req: AuthRequest, res: Response) => {
    try {
      const users = await User.find()
        .select("-password")
        .sort({ createdAt: -1 });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

// PUT /api/auth/users/:id - Admin only
router.put(
  "/users/:id",
  authenticate,
  adminOnly,
  async (req: AuthRequest, res: Response) => {
    try {
      const { fullName, role } = req.body;
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { fullName, role },
        { new: true }
      ).select("-password");

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

// DELETE /api/auth/users/:id - Admin only
router.delete(
  "/users/:id",
  authenticate,
  adminOnly,
  async (req: AuthRequest, res: Response) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json({ message: "User deleted" });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
