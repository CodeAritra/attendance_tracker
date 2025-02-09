import express from "express";
import { addRoutine, deleteSubject, getRoutine, getSubject } from "../controllers/routineController.js";
import {authenticateToken} from "../middlewares/token.js"

const router = express.Router();

router.post("/add",authenticateToken,addRoutine)
router.get("/get",authenticateToken,getRoutine)
router.delete("/delete",authenticateToken,deleteSubject)
router.get("/today-subjects",authenticateToken,getSubject)

export default router;
