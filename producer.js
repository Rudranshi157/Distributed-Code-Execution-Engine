const queue = require("./queue");

async function main() {
    await queue.add("execute-code", {
        language: "javascript",
        code: "console.log('Hello World')",
    });

    console.log("✅ Job added");
}

main();