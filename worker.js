const { Worker } = require("bullmq");

const worker = new Worker(
    "code-execution",
    async (job) => {
        console.log("Processing job...");
        // console.log(job.name);
        const { language, code } = job.data;

        console.log(`Running ${language}`);
        console.log(code);
    },
    {
        connection: {
            host: "127.0.0.1",
            port: 6379,
        },
    }
);

console.log("🚀 Worker started");