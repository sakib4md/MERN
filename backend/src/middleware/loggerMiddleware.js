const loggerMiddleware = (req, res, next) => {
    console.log("Request from:", req.headers["user-agent"]);
    try {
        console.log(`${req.method} ${req.url}`);
    } catch (err) {
        console.error("Logger error:", err);
    }
    next();
};

module.exports = loggerMiddleware;