import axios from "axios";
import HttpError from "../utils/HttpError.js";

const BASE_URL = process.env.INFERMEDICA_BASE_URL;
const APP_ID = process.env.INFERMEDICA_APP_ID;
const APP_KEY = process.env.INFERMEDICA_APP_KEY;
const isDev = process.env.NODE_ENV !== "production";

const client = axios.create({
    baseURL: BASE_URL,
    headers: {
        "App-Id": APP_ID,
        "App-Key": APP_KEY,
        "Accept": "application/json",
        "Content-Type": "application/json",
        ...(isDev ? { "Dev-Mode": "true" } : {}),
    },
    timeout: 10_000,
});

const parseAge = (raw) => {
    const n = typeof raw === "number" ? raw : Number(raw);
    if (!Number.isFinite(n)) return null;
    return Math.trunc(n);
};

// GET /api/infermedica/symptoms: get all symptoms
export const getSymptoms = async (req, res, next) => {
    try {
        const age = parseAge(req.query.age);

        if (age === null) {
            return next(new HttpError(400, "Missing or invalid age query parameter", "BAD_REQUEST"));
        }
        if (age < 1 || age > 120) {
            return next(new HttpError(400, "Age must be between 1 and 120", "BAD_REQUEST"));
        }

        const params = {
            "age.value": age,
            "age.unit": "year",
        };

        const response = await client.get("/symptoms", { params });
        return res.status(200).json(response.data);
    } catch (err) {
        if (err.code === "ECONNABORTED") {
            return next(new HttpError(504, "Infermedica timed out", "UPSTREAM_TIMEOUT"));
        }
        if (err.response) {
            const msg = err.response.data?.message || "Infermedica API error";
            return next(new HttpError(err.response.status, msg, "UPSTREAM_ERROR"));
        }
        return next(new HttpError(502, "Failed to fetch symptoms", "UPSTREAM_UNAVAILABLE"));
    }
};

// POST /api/infermedica/diagnosis
export const submitDiagnosis = async (req, res, next) => {
    try {
        const { sex, age, evidence } = req.body;
        const parsedAge = parseAge(age);

        if (sex !== "male" && sex !== "female") {
            return next(new HttpError(400, "sex is required and must be 'male' or 'female'", "BAD_REQUEST"));
        }
        if (parsedAge === null || parsedAge < 1 || parsedAge > 120) {
            return next(new HttpError(400, "age is required and must be between 1 and 120", "BAD_REQUEST"));
        }
        if (!Array.isArray(evidence)) {
            return next(new HttpError(400, "evidence is required and must be an array", "BAD_REQUEST"));
        }

        // Build the request body
        const body = {
            sex,
            age: { value: parsedAge, unit: "year" },
            evidence,
            extras: {
                disable_groups: true,
                interview_mode: "short_triage",
                enable_explanations: true,
                include_condition_details: true,
            },
        };

        if (isDev) {
            console.log("[Infermedica] POST /diagnosis", {
                sex,
                age: parsedAge,
                evidenceCount: evidence.length,
            });
        }

        const response = await client.post("/diagnosis", body);
        return res.status(200).json(response.data);
    } catch (err) {
        if (err.code === "ECONNABORTED") {
            return next(new HttpError(504, "Infermedica timed out", "UPSTREAM_TIMEOUT"));
        }
        if (err.response) {
            const msg = err.response.data?.message || "Infermedica API error";
            return next(new HttpError(err.response.status, msg, "UPSTREAM_ERROR"));
        }
        return next(new HttpError(502, "Failed to fetch diagnosis", "UPSTREAM_UNAVAILABLE"));
    }
};

// GET /api/infermedica/conditions/:id
export const getConditionById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const age = parseAge(req.query.age);

        if (!id) return next(new HttpError(400, "Missing condition id", "BAD_REQUEST"));
        if (age === null) return next(new HttpError(400, "Missing or invalid age query parameter", "BAD_REQUEST"));
        if (age < 1 || age > 120) return next(new HttpError(400, "Age must be between 1 and 120", "BAD_REQUEST"));

        const params = {
            "age.value": age,
            "age.unit": "year",
        };

        const response = await client.get(`/conditions/${id}`, { params });
        return res.status(200).json(response.data);
    } catch (err) {
        if (err.code === "ECONNABORTED") {
            return next(new HttpError(504, "Infermedica timed out", "UPSTREAM_TIMEOUT"));
        }
        if (err.response) {
            const msg = err.response.data?.message || "Infermedica API error";
            return next(new HttpError(err.response.status, msg, "UPSTREAM_ERROR"));
        }
        return next(new HttpError(502, "Failed to fetch condition", "UPSTREAM_UNAVAILABLE"));
    }
};

