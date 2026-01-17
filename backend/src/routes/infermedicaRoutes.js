import express from "express";
import {
    getSymptoms,
    submitDiagnosis,
    getConditionById
} from "../controllers/infermedicaController.js";

import symptomCheckRateLimiter from "../middleware/symptomCheckRateLimiter.js";

const router = express.Router();

router.use(symptomCheckRateLimiter);

// GET all symptoms
router.get("/symptoms", getSymptoms);

// POST diagnosis (initial + follow-up)
router.post("/diagnosis", submitDiagnosis);

// GET condition details
router.get("/conditions/:id", getConditionById);

export default router;
