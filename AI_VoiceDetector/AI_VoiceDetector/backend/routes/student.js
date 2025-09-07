
// routes/student.js
import express from "express";
import {
   joinTest,
   startTest,
   submitTest,
   getUpcomingTestsForStudent,
} from "../controllers/studentController.js";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js"
import { getTestStudents } from "../controllers/examinerController.js";

const router = express.Router();

router.get("/upcoming", verifyToken, authorizeRoles("student"), getUpcomingTestsForStudent);
router.post("/join/:testId", verifyToken, authorizeRoles("student"), joinTest);
router.post("/start/:testId", verifyToken, authorizeRoles("student"), startTest);
router.post("/submit/:testId", verifyToken, authorizeRoles("student"), submitTest);
router.get("/test/:testId/students", getTestStudents);

export default router;