import express from "express";
import { clearALL, login, signUp } from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/token.js";

const router = express.Router();

router.post("/register", signUp);
router.post("/login", login);
router.delete("/clear-all", authenticateToken, clearALL);

export default router;
