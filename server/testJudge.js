require("dotenv").config();
const connectDB = require("./config/db");
const Problem = require("./models/Problem");
const judge = require("./judge/judge");

const run = async () => {
    await connectDB();

    const problem = await Problem.findOne({
        title: "Find Sum"
    });

    const result = await judge({
        problemId: problem._id,
        language: "python",
        code: `a, b = map(int, input().split())
print(a + b)`
            });
//         code: `a, b = map(int, input().split())
// print(a / 0)`
//             });

    console.log(result);

    process.exit(0);
};

run();