const { Worker } = require("bullmq");
const execute = require("./execute");
const {redisPublish} = require("./redis");
const { json } = require("express");

const worker = new Worker(
    "code-execution",
    async (job) => {

        console.log(`Started Job ${job.id} `);
        console.log(job.data);
        const {language, code, input, clientId} = job.data;
        
        const status = {
            jobId: job.id,
            clientId,
            status: "active"
        };
        redisPublish.publish("job-status", JSON.stringify(status) );
        // console.log(":", language);
        console.log("Client ID:", clientId);
        console.log(`Language: ${language}`);

        try{
            const result = await execute(language, code, input);

            console.log(`Finished Job: ${job.id}`);

            return result;
        }catch(err){
            if(err.code === "TLE"){
                return {
                    success: false,
                    status: "Time Limit Exceeded",
                    executionTime: err.executionTime,
                }
            }
            if(err.code === "OLE"){
                return {
                    success: false,
                    status: "Output Limit Exceeded",
                    executionTime: err.executionTime,
                }
            } 
            if (err.message === "Unsupported language") {
                return {
                    success: false,
                    status: "Unsupported language"
                };
            }

            throw err;
        }

        
    },
    {
        connection: {
            host: "127.0.0.1",
            port: 6379,
        },
        concurrency: 3,
    }
);

worker.on("completed", (job, result) => {
    console.log(`Job ${job.id} completed`);
    console.log("Result:", result);
    const clientId = job.data.clientId;
    const status = {
        jobId: job.id,
        clientId,
        status: "completed",
        result: result
    };
    redisPublish.publish("job-status", JSON.stringify(status));
    
});

worker.on("failed", (job, err) => {
    console.log(`job ${job.id} failed`);
    console.log(err.message);
    const clientId = job.data.clientId;
    const status = {
        jobId: job.id,
        clientId,
        status: "failed",
        error: err.message
    };
    redisPublish.publish("job-status", JSON.stringify(status));
});

console.log("🚀 Worker started");