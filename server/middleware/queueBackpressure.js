const executionQueue = require("../queue");

const MAX_WAITING_JOBS = 50;

const queueBackpressure = async (req, res, next) => {
    try{
        const counts = await executionQueue.getJobCounts("waiting");
        if(counts.waiting  >= MAX_WAITING_JOBS){
            return res.status(503).json({
                error: "Server is busy. Please try again later."
            });
        }
    }catch(err){
        console.error("Queue backpressure error:", err);
        return res.status(500).json({
            error: "Internal Server Error",
            message: "Unable to process request."
        })
    }
    next();

}

module.exports = queueBackpressure;