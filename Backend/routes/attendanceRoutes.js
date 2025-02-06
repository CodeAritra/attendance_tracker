import express from "express";
import { getAttendance, markAttendance } from "../controllers/attendanceController.js";
import {authenticateToken} from "../middlewares/token.js"


const router = express.Router();

router.post("/mark",authenticateToken,markAttendance)
router.get("/get",authenticateToken,getAttendance)

export default router;
