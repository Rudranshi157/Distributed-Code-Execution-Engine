const dotenv = require("dotenv").config();
const express = require("express");
const cors = require("cors");
const executionQueue = require("./queue.js");
const connectDB = require("./config/db.js");
const app = express();
const authRoutes = require("./routes/auth");
const problemRoutes = require("./routes/problem");
const submissionRoutes = require("./routes/submission.js");
const auth = require("./middleware/auth");
const Submission = require("./models/Submission.js");
const Problem = require("./models/Problem.js");
const rateLimitMiddleware = require("./middleware/rateLimiter.js");
const queueBackpressure = require("./middleware/queueBackpressure.js");
const { getQueueStats } = require("./utils/queueMonitor");
const mongoose = require("mongoose");
const { redisPublish } = require("./redis");

app.use(cors());
app.use(express.json({limit: "100kb"}));

app.use((req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - start;

        console.log(
            `[API] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`
        );
    });

    next();
});

app.use("/auth", authRoutes);
app.use("/api", submissionRoutes);
app.use("/api/problems", problemRoutes);

connectDB();

app.get("/", (req, res) => {
    res.send("Remote Code Runner API");
});

app.get("/health/queue", async (req, res) => {
    try {
        const stats = await getQueueStats();

        return res.json(stats);

    } catch (err) {
        console.error("Queue health check error:", err);

        return res.status(500).json({
            status: "error",
            error: "Unable to fetch queue stats"
        });
    }
});

app.get("/health", async (req, res) => {
    try {
        const queueStats = await getQueueStats();

        const redisStatus = redisPublish.status === "ready";
        const mongoStatus = mongoose.connection.readyState === 1;

        const healthy =
            redisStatus &&
            mongoStatus &&
            queueStats.status === "healthy";

        return res.status(healthy ? 200 : 503).json({
            status: healthy ? "healthy" : "degraded",
            services: {
                redis: redisStatus ? "connected" : "disconnected",
                mongodb: mongoStatus ? "connected" : "disconnected",
                queue: queueStats.status,
            },
            queue: queueStats.counts,
        });

    } catch (err) {
        console.error("Health check error:", err.message);

        return res.status(503).json({
            status: "degraded",
            error: "Health check failed"
        });
    }
});

app.post("/execute", auth, rateLimitMiddleware, queueBackpressure, async (req, res) => {
   
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
                submissionId    : submission._id,
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
            error: "Failed to queue execution",
            clientId
        });
        
    }

});

app.post("/submit", auth, rateLimitMiddleware, queueBackpressure, async (req, res) => {
    const {problemId, language, code, clientId} = req.body || {};
    // console.log("Authenticated user:", req.user);
    if(!problemId){
        return res.status(400).json({
            success: false,
            error: "Problem ID is required"
        });
    }
    if(!language){
        return res.status(400).json({
            success: false,
            error: "Language is required"
        });
    }
    if(!code){
        return res.status(400).json({
            success: false,
            error: "Code is required"
        });
    }
    try{
        let userId = req.user.userId;
        let problem = await Problem.findById(problemId);

        if(!problem){
            return res.status(404).json({
                success: false,
                error: "Problem not found"
            });
        }

        const submission = await Submission.create({
            userId,
            problemId,
            language,
            code,
            status: "queued"
        });
        const job = await executionQueue.add(
            "judge-code",
            {
                type: "judge",
                problemId,
                language,
                code,
                clientId,
                userId,
                submissionId: submission._id
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
            submissionId: submission._id,
            state: "queued",
            clientId
        });
    }catch(error){
        return res.status(500).json({
            success: false,
            error: "Failed to queue execution"
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
