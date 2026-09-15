const { Redis } = require("ioredis");
const { RateLimiterRedis } = require("rate-limiter-flexible");

const rateLimiterRedis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
});

const rateLimiter = new RateLimiterRedis({
    storeClient: rateLimiterRedis,
    keyPrefix: "dcee_rate_limit",
    points: 100,
    duration: 60,
});


module.exports = rateLimiter;