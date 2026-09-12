const { Redis } = require("ioredis");
const { RateLimiterRedis } = require("rate-limiter-flexible");

const rateLimiterRedis = new Redis({
    host: "localhost",
    port: 6379,
});

const rateLimiter = new RateLimiterRedis({
    storeClient: rateLimiterRedis,
    keyPrefix: "dcee_rate_limit",
    points: 100,
    duration: 60,
});


module.exports = rateLimiter;