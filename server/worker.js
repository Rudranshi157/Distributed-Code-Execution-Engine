require("dotenv").config();
const { Worker } = require("bullmq");
const execute = require("./execute");
const {redisPublish} = require("./redis");
const Submission = require("./models/Submission");
const connectDB = require("./config/db.js");

connectDB();

const worker = new Worker(
    "code-execution",
    async (job) => {

        console.log(`Started Job ${job.id} `);
        console.log(job.data);
        const {language, code, input, clientId, submissionId} = job.data;
        
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

            await Submission.findByIdAndUpdate(
                submissionId,
                {
                    status: result.success === false ? "failed" : "completed",
                    output: result.stdout || "",
                    error: result.stderr || "",
                    executionTime: result.executionTime || 0
                }
            );

            return result;

        }catch(err){
            if(err.code === "TLE"){
                const result = {
                    success: false,
                    status: "Time Limit Exceeded",
                    executionTime: err.executionTime,
                };

                await Submission.findByIdAndUpdate(
                    submissionId,
                    {
                        status: "failed",
                        error: result.status,
                        executionTime: result.executionTime || 0
                    }
                );
                return result;
            }
            if(err.code === "OLE"){
                const result = {
                    success: false,
                    status: "Output Limit Exceeded",
                    executionTime: err.executionTime,
                }
                await Submission.findByIdAndUpdate(
                    submissionId,
                    {
                        status: "failed",
                        error: result.status,
                        executionTime: result.executionTime || 0
                    }
                );
                return result;
            } 
            if (err.message === "Unsupported language") {
                const result = {
                    success: false,
                    status: "Unsupported language"
                };

                await Submission.findByIdAndUpdate(
                    submissionId,
                    {
                        status: "failed",
                        error: result.status,
                    }
                );
                return result;
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