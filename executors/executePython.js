const executePython = async (code, input) => {
const fs = require('node:fs/promises');
const path = require("node:path");
const dockerRun = require("../utils/dockerRun");
const formatResult = require("../utils/formatResult");

let dir;

    try{
        await fs.mkdir("temp", { recursive: true });
        const prefix = path.join("temp", "run-");
        dir = await fs.mkdtemp(prefix);   
        const file = path.join(dir, "main.py");
        await fs.writeFile(file, code, {
            encoding: "utf8",
        });
        const absoluteDir = path.resolve(dir);
        // let output =  await run("python", [file], {}, input);
        const result = await dockerRun({
            image: "code-runner-python",
            mountDir: absoluteDir,
            workDir: "/app",
            command: ["python", "main.py"],
            input,
        });

        return formatResult({
            status: result.exitCode === 0 ? "Accepted" : "Runtime Error",
            ...result,
        });
                        
    }finally{
    if(dir){
            await fs.rm(dir, {
                recursive: true,
                force: true,
            });
        }
    }


}

module.exports = executePython;