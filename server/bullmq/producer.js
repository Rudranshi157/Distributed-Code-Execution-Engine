const queue = require("./queue");

async function main() {
    // const job = await queue.add("execute-code", {
    //     language: "javascript",
    //     code: "console.log('Hello World')",
    // },{
    //     attempts: 3,
    //     backoff: {
    //         type: "fixed",
    //         delay: 2000,
    //     }
    // });
    for (let i = 1; i <= 5; i++) {
        const job = await queue.add("execute-code", {
            number: i,

        });
        console.log("Job ID:", job.id);

}

}

main();