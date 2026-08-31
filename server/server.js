const express = require("express");
const cors = require("cors");
const executionQueue = require("./queue.js");
const connectDB = require("./config/db.js");
const dotenv = require("dotenv").config();
const app = express();
const authRoutes = require("./routes/auth");
const submissionRoutes = require("./routes/submission.js");
const auth = require("./middleware/auth");
const Submission = require("./models/Submission.js");

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/api", submissionRoutes);

connectDB();

app.get("/", (req, res) => {
    res.send("Remote Code Runner API");
});


app.post("/execute", auth, async (req, res) => {
   
    // console.log("Content-Type:", req.headers["content-type"]);
    // console.log("Body:", req.body);
    const {language, code, input, clientId} = req.body || {};

    //   console.log("CLIENT ID RECEIVED BY SERVER:", clientId);
    if(!language) {
        return res.status(400).json({
            success: false,
            error: "Language is required",
        });
    }
    if(!code) {
        return res.status(400).json({
            success: false,
            error: "Code is required",
        });
    }

    try {
        const userId = req.user.userId;

        const submission = await Submission.create({
            userId,
            language,
            code,
            input,
            status: "queued"
        });

        const job = await executionQueue.add(
            "execute-code", 
            {
                language,
                code,
                input,
                clientId,
                userId,
                submissionId    : submission._id
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
            state: "queued",
            clientId
        });

    }catch (err) {
      
        return res.status(500).json({
            success: false,
            error: err.message,
            clientId
        });
        
    }

});

app.get("/result/:id", auth, async (req, res) => {
    const jobId = req.params.id;
    const job = await executionQueue.getJob(jobId);
    const userId = req.user.userId;

    
    if(!job){
        return res.status(404).json({
            success: false,
            error: "Job not found"
        });
    }
    if(job.data.userId !== userId){
        return res.status(403).json({
            message: "Access denied"
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