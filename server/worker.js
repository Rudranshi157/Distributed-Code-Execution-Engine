require("dotenv").config();

const WORKER_ID = process.env.WORKER_ID || `worker-${process.pid}`;

const { Worker } = require("bullmq");
const execute = require("./execute");
const judge = require("./judge/judge");
const {redisPublish} = require("./redis");
const Submission = require("./models/Submission");
const connectDB = require("./config/db.js");


connectDB();

const worker = new Worker(
    "code-execution",
    async (job) => {

        console.log(
            `[${WORKER_ID}] Started Job ${job.id} | Attempt ${job.attemptsMade + 1}`
        );
        
        const {type, problemId, language, code, input, clientId, submissionId} = job.data;
        
        const status = {
            jobId: job.id,
            clientId,
            status: "active"
        };
        redisPublish.publish("job-status", JSON.stringify(status) );
        // console.log(":", language);
        // console.log("Client ID:", clientId);
        // console.log(`Language: ${language}`);

        try{
            let result;
            if(type === "judge"){
                // console.log(`Judging Job ${job.id}`);
                // console.log(`Problem ID: ${problemId}`);

                const judgeResult = await judge({
                    problemId,
                    language,
                    code
                });

                result = {
                    success: judgeResult.verdict === "Accepted",
                    status: judgeResult.verdict,
                    verdict: judgeResult.verdict,
                    passedTests: judgeResult.passedTests,
                    totalTests: judgeResult.totalTests,
                    testResults: judgeResult.publicTestResults,
                    hiddenTests: judgeResult.hiddenTests
                };
                
                await Submission.findByIdAndUpdate(
                    submissionId,
                    {
                        status: "completed",
                        verdict: judgeResult.verdict,
                        passedTests: judgeResult.passedTests,
                        totalTests: judgeResult.totalTests,
                        testResults: judgeResult.publicTestResults,
                        hiddenTests: judgeResult.hiddenTests
                    }
                );
                
            }else{
                result = await execute(language, code, input);

                // console.log(`Finished Job: ${job.id}`);

                await Submission.findByIdAndUpdate(
                    submissionId,
                    {
                        status: result.success === false ? "failed" : "completed",
                        output: result.stdout || "",
                        error: result.stderr || "",
                        executionTime: result.executionTime || 0
                    }
                );
            }
            

            return result;

        }catch(err){

            // Expected user-code failure.
            // Return instead of throwing so BullMQ does not retry.
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


            // Unexpected infrastructure/system error.
            // Throw so BullMQ marks the job as failed and retries it.
            throw err;
        }

        
    },
    {
        connection: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
        },
        concurrency: 3,
    }
);

worker.on("completed", (job, result) => {
    console.log(`[${WORKER_ID}] Job ${job.id} completed`);
    console.log("Result:", result);
    const clientId = job.data.clientId;
    const status = {
        jobId: job.id,
        clientId,
        status: "completed",
        result: result
    };
    redisPublish.publish("job-status", JSON.stringify(status));

    //Tell dashboard to refresh submission
    const dashboardUpdate = {
        type: "submission-updated",
    };
    redisPublish.publish("job-status", JSON.stringify(dashboardUpdate));
   
    
});

worker.on("failed", async (job, err) => {
    console.log(`[${WORKER_ID}] Job ${job.id} failed`);
    console.log(err.message);

    if(job.attemptsMade < job.opts.attempts){
        console.log(`[${WORKER_ID}] Job ${job.id} will be retried`);
        return;
    }

    console.log(`[${WORKER_ID}] Job ${job.id} exhausted all retry attempts`);

    await Submission.findByIdAndUpdate(
        job.data.submissionId,
        {
            status: "failed",
            error: err.message
        }
    );

    const clientId = job.data.clientId;

    const status = {
        jobId: job.id,
        clientId,
        status: "failed",
        error: err.message
    };

    redisPublish.publish("job-status", JSON.stringify(status));

    //Tell dashboard to refresh submission
    const dashboardUpdate = {
        type: "submission-updated",
    };
    redisPublish.publish("job-status", JSON.stringify(dashboardUpdate));
   
});

console.log(`🚀 ${WORKER_ID} started`);