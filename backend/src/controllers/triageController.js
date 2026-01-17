import mongoose from 'mongoose';
import Triage from '../models/Triage.js';
import HttpError from "../utils/HttpError.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/triage: get all triage records for a user
export async function getAllTriages(req, res, next) {
    try {
        const userId = req.user?._id;
        if (!userId) return next(new HttpError(401, "Request is not authorized", "UNAUTHORIZED"));

        const triages = await Triage.find({ userId }).sort({ createdAt: -1 });

        return res.status(200).json({ triages });
    } catch (err) {
        return next(err);
    }
}

// GET /api/triage/:id: get one triage record for a user
export async function getOneTriage(req, res, next) {
    try {
        const { id } = req.params;
        const userId = req.user?._id;
        if (!userId) return next(new HttpError(401, "Request is not authorized", "UNAUTHORIZED"));

        if (!isValidObjectId(id)) return next(new HttpError(400, "Invalid triage ID", "BAD_REQUEST"));

        const triage = await Triage.findOne({ _id: id, userId });
        if (!triage) return next(new HttpError(404, "Triage record not found", "NOT_FOUND"));

        return res.status(200).json({ triage });
    } catch (err) {
        return next(err);
    }
}

// POST /api/triage: create one triage record for a user
export async function createTriage(req, res, next) {
    try {
        const userId = req.user?._id;
        if (!userId) return next(new HttpError(401, "Request is not authorized", "UNAUTHORIZED"));

        // Explicit whitelist from your schema (no ...req.body)
        const {
            diagnosisCommon,
            diagnosisMedical,
            probability,
            symptoms,
            notes,
        } = req.body;

        if (typeof diagnosisMedical !== "string" || !diagnosisMedical.trim()) {
            return next(new HttpError(400, "diagnosisMedical is required", "BAD_REQUEST"));
        }

        if (typeof probability !== "number" || probability < 0 || probability > 1) {
            return next(new HttpError(400, "probability must be a number between 0 and 1", "BAD_REQUEST"));
        }

        if (symptoms !== undefined && !Array.isArray(symptoms)) {
            return next(new HttpError(400, "symptoms must be an array of strings", "BAD_REQUEST"));
        }

        if (notes !== undefined && typeof notes !== "string") {
            return next(new HttpError(400, "notes must be a string", "BAD_REQUEST"));
        }

        const triage = await Triage.create({
            userId,
            diagnosisCommon: typeof diagnosisCommon === "string" ? diagnosisCommon.trim() : undefined,
            diagnosisMedical: diagnosisMedical.trim(),
            probability,
            symptoms: Array.isArray(symptoms) ? symptoms : undefined,
            notes: typeof notes === "string" ? notes.trim() : undefined,
        });

        return res.status(201).json({ triage });
    } catch (err) {
        return next(err);
    }
}

// PATCH /api/triage/:id: update one triage record for a user (only notes)
export async function updateTriage(req, res, next) {
    try {
        const { id } = req.params;
        const userId = req.user?._id;
        if (!userId) return next(new HttpError(401, "Request is not authorized", "UNAUTHORIZED"));

        if (!isValidObjectId(id)) return next(new HttpError(400, "Invalid triage ID", "BAD_REQUEST"));

        const { notes } = req.body;

        if (notes === undefined) {
            return next(new HttpError(400, "Notes is required", "BAD_REQUEST"));
        }
        if (typeof notes !== "string") {
            return next(new HttpError(400, "Notes must be a string", "BAD_REQUEST"));
        }

        const trimmed = notes.trim();
        if (trimmed.length > 5000) {
            return next(new HttpError(400, "Notes is too long (max 5000 characters)", "BAD_REQUEST"));
        }

        const updated = await Triage.findOneAndUpdate(
            { _id: id, userId },
            { notes: trimmed },
            { new: true, runValidators: true }
        );

        if (!updated) return next(new HttpError(404, "Triage record not found", "NOT_FOUND"));

        return res.status(200).json({ triage: updated });
    } catch (err) {
        return next(err);
    }
}

// DELETE /api/triage/:id: delete one triage record for a user
export async function deleteTriage(req, res, next) {
    try {
        const { id } = req.params;
        const userId = req.user?._id;
        if (!userId) return next(new HttpError(401, "Request is not authorized", "UNAUTHORIZED"));

        if (!isValidObjectId(id)) return next(new HttpError(400, "Invalid triage ID", "BAD_REQUEST"));

        const deleted = await Triage.findOneAndDelete({ _id: id, userId });
        if (!deleted) return next(new HttpError(404, "Triage record not found", "NOT_FOUND"));

        // Either 200 with message OR 204. Your choice; 204 is common for deletes.
        return res.sendStatus(204);
    } catch (err) {
        return next(err);
    }
}
