const {Redis} = require("ioredis");

const redisPublish = new Redis({
    host: "localhost",
    port: 6379,
});

const redisSubscribe = new Redis({
    host: "localhost",
    port: 6379,
});

module.exports = {
    redisPublish, 
    redisSubscribe
};