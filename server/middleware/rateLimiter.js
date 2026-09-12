const rateLimiter = require("../config/rateLimiter");

const rateLimitMiddleware = async (req, res, next) => {
    try{
        const key = req.user.userId;

        await rateLimiter.consume(key);

        next();
    }catch(err) {
        if (err.remainingPoints === 0) {
            return res.status(429).json({
                error: "Too Many Requests",
                message: "You have exceeded your request limit. Please try again later."
            });
        }

        console.error("Rate limiter error:", err);

        return res.status(500).json({
            error: "Internal Server Error",
            message: "Unable to process request."
        });
    };

}

module.exports = rateLimitMiddleware;