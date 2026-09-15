const { Queue } = require("bullmq");

const executionQueue = new Queue("code-execution", {
    connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
    },
});

module.exports = executionQueue;