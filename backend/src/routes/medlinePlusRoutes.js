import express from "express";
import { getHealthInfoByCode } from "../controllers/medlinePlusController.js";
import symptomCheckRateLimiter from "../middleware/symptomCheckRateLimiter.js";

const router = express.Router();
router.use(symptomCheckRateLimiter);

router.get("/:code", getHealthInfoByCode);

export default router;
