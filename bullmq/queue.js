const { Queue } = require("bullmq");

const executionQueue = new Queue("code-execution", {
    connection: {
        host: "127.0.0.1",
        port: 6379,
    },
});

module.exports = executionQueue;