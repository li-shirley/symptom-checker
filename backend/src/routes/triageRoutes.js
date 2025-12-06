import express from 'express';

import { getAllTriages, getOneTriage, createTriage, updateTriage, deleteTriage } from '../controllers/triageController.js';

import authRateLimiter from "../middleware/authRateLimiter.js";
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router()

router.use(requireAuth, authRateLimiter);

// get all 
router.get("/", getAllTriages);

// get one
router.get("/:id", getOneTriage);

// create one
router.post("/", createTriage);

// update one
router.patch("/:id", updateTriage);

// delete one
router.delete("/:id", deleteTriage);


export default router