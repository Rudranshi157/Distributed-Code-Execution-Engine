const { Worker } = require("bullmq");
const execute = require("../execute");

const worker = new Worker(
    "code-execution",
    async (job) => {

        console.log(`Started Job ${job.id} `);
       
        const {language, code, input} = job.data;
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
    
});

worker.on("failed", (job, err) => {
    console.log(`job ${job.id} failed`);
    console.log(err.message);
});

console.log("🚀 Worker started");