const mongoose = require("mongoose");

const testCaseSchema = new mongoose.Schema(
    {
        problemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Problem",
            required: true,
            index: true
        },

        input: {
            type: String,
            required: true
        },

        expectedOutput: {
            type: String,
            required: true
        },

        isHidden: {
            type: Boolean,
            default: false
        },

        order: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

testCaseSchema.index({ problemId: 1, order: 1 });

module.exports = mongoose.model("TestCase", testCaseSchema);