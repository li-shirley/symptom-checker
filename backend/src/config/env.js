import dotenv from "dotenv";
dotenv.config();

const required = [
    "CLIENT_URL",
    "PORT",
    "MONGO_URI",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
    "INFERMEDICA_BASE_URL",
    "INFERMEDICA_APP_ID",
    "INFERMEDICA_APP_KEY",
    "MEDLINEPLUS_BASE_URL",
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
}
