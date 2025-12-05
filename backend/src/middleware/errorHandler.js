const errorHandler = (err, _, res, _) => {
    console.error(err.stack); // server-side logging only

    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Something went wrong'
            : err.message, // detailed in dev
    });
};

export default errorHandler;
