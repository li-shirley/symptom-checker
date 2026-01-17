import crypto from "crypto";

const logger = (req, res, next) => {
    //skip health check noise
    if (req.path === "/health") return next();

    // compute request start time/duration
    const start = process.hrtime.bigint();

    // generate unique request ID for tracking if not supplied in headers
    const incoming = req.headers["x-request-id"];
    const requestId =
        typeof incoming === "string" && incoming.trim()
            ? incoming.trim()
            : crypto.randomUUID();
    req.requestId = requestId;
    res.setHeader("X-Request-Id", requestId);

    res.on("finish", () => {
        // endTime - startTime (nanoseconds), convert to milliseconds by dividing by 1e6
        const durationMs = Number(process.hrtime.bigint() - start) / 1e6;

        console.log(
            `[${new Date().toISOString()}] ${requestId} ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(1)}ms`
        );
    });

    next();
};

export default logger;
