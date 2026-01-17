const defaultCodeByStatus = {
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    409: "CONFLICT",
    422: "UNPROCESSABLE_ENTITY",
    429: "RATE_LIMITED",
};

const errorHandler = (err, req, res, next) => {
    // Prevent sending a second response if headers already went out
    if (res.headersSent) return next(err);

    const status = Number.isInteger(err.status) ? err.status : 500;

    const message =
        process.env.NODE_ENV === "production"
            ? "Something went wrong"
            : err.message || "Something went wrong";

    const code =
        err.code ||
        defaultCodeByStatus[status] ||
        (status === 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR");

    // Log safely
    if (process.env.NODE_ENV !== "production") {
        console.error(err.stack || err);
    } else {
        console.error({
            requestId: req.requestId,
            status,
            code,
            message: err.message,
            meta: err.meta,
            method: req.method,
            path: req.originalUrl,
        });
    }

    res.status(status).json({
        error: {
            message,
            code,
            requestId: req.requestId
        },
    });
};

export default errorHandler;
