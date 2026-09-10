const express = require("express");

const Problem = require("../models/Problem");
const router = express.Router();

router.get("/", async (req, res) => {
    try{
        const problems = await Problem.find().select("_id title description");
        res.json(problems);
    }catch(error){
        res.status(500).json({
            message: "Failed to fetch problems"
        });
    }
    

});

module.exports = router;