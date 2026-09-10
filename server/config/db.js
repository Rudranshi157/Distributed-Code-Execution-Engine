const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");
    } catch (error) {
        // console.error("MongoDB connection failed:", error.message);
        // process.exit(1);
        console.error("MongoDB connection failed");
        console.error("Name:", error.name);
        console.error("Message:", error.message);
        console.error("Cause:", error.cause);
        console.error("Reason:", error.reason);
        process.exit(1);
    }
};

module.exports = connectDB;