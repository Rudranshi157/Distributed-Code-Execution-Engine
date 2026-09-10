const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    language: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    input: {
        type: String,
        default: ""
    },
    output: {
        type: String,
        default: ""
    },
    error: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        required: true
    },
    executionTime: {
        type: Number,
        default: 0
    },
    verdict: {
        type: String,
        default: ""
    },
    passedTests: {
        type: Number,
        default: 0
    },
    totalTests: {
        type: Number,
        default: 0
    }, 
    testResults:[
        {
            test: Number,
            status: String,
            executionTime: Number
        }
    ],
    hiddenTests: {
        passed: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            default: 0
        }
    },
    
},{
    timestamps: true
});

const Submission = mongoose.model("Submission", submissionSchema);

module.exports = Submission;