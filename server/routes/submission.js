const express = require("express");
const auth = require("../middleware/auth");
const Submission = require("../models/Submission");
const router = express.Router();

router.get("/submissions", auth, async (req, res)=> {
    try{
        const userId = req.user.userId;
        const submissions = await Submission.find({userId})
         .populate("problemId", "title");
        return res.json({
            success: true,
            submissions
        });
    }catch(error){
        console.error("Error fetching submissions:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch submissions"
        });
    }
});

router.get("/submissions/:id", auth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const submissionId = req.params.id;

        const submission = await Submission.findOne({
            _id: submissionId,
            userId: userId
        }).populate("problemId", "title");

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: "Submission not found"
            });
        }

        return res.json({
            success: true,
            submission
        });

    } catch (error) {
        console.error("Error fetching submission:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch submission"
        });
    }
});

module.exports = router;