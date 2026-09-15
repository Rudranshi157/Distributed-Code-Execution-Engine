const {Redis} = require("ioredis");

const redisPublish = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
});

const redisSubscribe = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
});

module.exports = {
    redisPublish, 
    redisSubscribe
};