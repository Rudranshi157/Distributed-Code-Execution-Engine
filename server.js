const express = require("express");
const executionQueue = require("./bullmq/queue");
const app = express();

app.use(express.json());


app.get("/", (req, res) => {
    res.send("Remote Code Runner API");
});

app.post("/execute", async (req, res) => {
   
    // console.log("Content-Type:", req.headers["content-type"]);
    // console.log("Body:", req.body);
    const {language, code, input} = req.body || {};

    if(!language) {
        return res.status(400).json({
            success: false,
            error: "Language is required"
        });
    }
    if(!code) {
        return res.status(400).json({
            success: false,
            error: "Code is required"
        });
    }

    try {
        

        const job = await executionQueue.add(
            "execute-code", 
            {
                language,
                code,
                input,
            },{
                attempts: 3,
                backoff: {
                    type: "fixed",
                    delay: 2000,
                }
            }
        );

        return res.status(202).json({
            success: true,
            jobId: job.id,
            state: "queued"
        });

    }catch (err) {
      
        return res.status(500).json({
            success: false,
            error: err.message,
        });
        
    }

});

app.get("/result/:id", async (req, res) => {
    const jobId = req.params.id;
    const job = await executionQueue.getJob(jobId);
    if(!job){
        return res.status(404).json({
            success: false,
            error: "Job not found"
        });
    }
    const state = await job.getState();
    let data = {
        jobId,
        state,
    }
    if(state === "completed"){
        data.result = job.returnvalue;
    }else if(state === "failed"){
        data.error = job.failedReason;
    }
    return res.json(data);
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});