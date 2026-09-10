require("dotenv").config({
    path: "../.env"
});
const mongoose = require("mongoose");
const connectDB = require("../config/db.js");

const Problem = require("../models/Problem.js");
const TestCase = require("../models/TestCase.js");

const seedProblems = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        console.log("Connected to MongoDB");

        // Clear existing problems and test cases
        await TestCase.deleteMany({});
        await Problem.deleteMany({});

        console.log("Old problem data cleared");

        // ==========================================
        // Problem 1: Find Sum
        // ==========================================

        const problem1 = await Problem.create({
            title: "Find Sum",
            description:
                "Given two integers, print the sum of the two numbers."
        });

        await TestCase.insertMany([
            {
                problemId: problem1._id,
                input: "2 3",
                expectedOutput: "5",
                isHidden: false,
                order: 1
            },
            {
                problemId: problem1._id,
                input: "10 20",
                expectedOutput: "30",
                isHidden: false,
                order: 2
            },
            {
                problemId: problem1._id,
                input: "-5 10",
                expectedOutput: "5",
                isHidden: true,
                order: 3
            },
            {
                problemId: problem1._id,
                input: "0 100",
                expectedOutput: "100",
                isHidden: true,
                order: 4
            },
            {
                problemId: problem1._id,
                input: "100000 200000",
                expectedOutput: "300000",
                isHidden: true,
                order: 5
            }
        ]);

        // ==========================================
        // Problem 2: Maximum of Two Numbers
        // ==========================================

        const problem2 = await Problem.create({
            title: "Maximum of Two Numbers",
            description:
                "Given two integers, print the larger of the two numbers."
        });

        await TestCase.insertMany([
            {
                problemId: problem2._id,
                input: "5 10",
                expectedOutput: "10",
                isHidden: false,
                order: 1
            },
            {
                problemId: problem2._id,
                input: "20 7",
                expectedOutput: "20",
                isHidden: false,
                order: 2
            },
            {
                problemId: problem2._id,
                input: "-10 -3",
                expectedOutput: "-3",
                isHidden: true,
                order: 3
            },
            {
                problemId: problem2._id,
                input: "100 100",
                expectedOutput: "100",
                isHidden: true,
                order: 4
            },
            {
                problemId: problem2._id,
                input: "0 -5",
                expectedOutput: "0",
                isHidden: true,
                order: 5
            }
        ]);

        console.log("Problems and test cases seeded successfully");

    } catch (error) {

        console.error("Error while seeding:", error);

    } finally {

        await mongoose.connection.close();

        console.log("MongoDB connection closed");
    }
};

seedProblems();
