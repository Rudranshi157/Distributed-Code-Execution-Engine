const execute = require("./execute.js");
const fs = require("fs/promises");

async function main() {
    try{
        const language = process.argv[2];
        const filePath = process.argv[3];
        const inputPath = process.argv[4];

        const code = await fs.readFile(filePath, "utf-8");
        const input = await fs.readFile(inputPath, "utf-8");

        const output = await execute(language, code, input);
        
        console.log(output);
    }catch(err){
        console.error(err.message);

          // Optional, useful for debugging
            if(err.exitCode !== undefined){
                console.error("Exit Code:", err.exitCode);  
            }
    }
    
}

main();