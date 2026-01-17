import axios from "axios";
import HttpError from "../utils/HttpError.js";

const BASE_URL = process.env.MEDLINEPLUS_BASE_URL;

const client = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Accept": "application/json",
    },
    timeout: 10_000,
});

//GET /api/medlineplus/:code: Fetch patient-friendly health info for an ICD-10 code
export const getHealthInfoByCode = async (req, res, next) => {
    try {
        const raw = req.params.code;
        const code = typeof raw === "string" ? raw.trim().toUpperCase() : "";
        if (!code) return next(new HttpError(400, "Missing ICD-10 code", "BAD_REQUEST"));

        const params = {
            "mainSearchCriteria.v.c": code,
            "mainSearchCriteria.v.cs": "2.16.840.1.113883.6.90", // ICD-10-CM OID
            knowledgeResponseType: "application/json", // force JSON response
        };

        const response = await client.get("", { params });

        const data = response.data;
        const entries = data?.feed?.entry;

        if (!Array.isArray(entries) || entries.length === 0) {
            return next(new HttpError(404, "No MedlinePlus match for this code", "NOT_FOUND"));
        }

        return res.status(200).json(data);

    } catch (err) {
        // Axios upstream errors
        if (err.response) {
            return next(new HttpError(502, "MedlinePlus Connect error", "UPSTREAM_ERROR"));
        }
        // Timeout / DNS / network / etc.
        if (err.code === "ECONNABORTED") {
            return next(new HttpError(504, "MedlinePlus Connect timed out", "UPSTREAM_TIMEOUT"));
        }
        return next(new HttpError(502, "Failed to fetch MedlinePlus Connect data", "UPSTREAM_UNAVAILABLE"));
    }
};
