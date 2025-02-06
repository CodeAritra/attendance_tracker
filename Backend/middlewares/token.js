import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

export const authenticateToken = async (req, res, next) => {
  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      const token = req.header("Authorization")?.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.status(401).json({ error: "Not authorized, invalid token" });
    }
  } else {
    res.status(401).json({ error: "No token provided" });
  }
};
